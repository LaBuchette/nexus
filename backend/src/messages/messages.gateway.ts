import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private messagesService: MessagesService) {}

  // Quand un utilisateur se connecte
  handleConnection(client: Socket) {
    console.log(`🔌 Client connecté: ${client.id}`);
  }

  // Quand un utilisateur se déconnecte
  handleDisconnect(client: Socket) {
    console.log(`🔌 Client déconnecté: ${client.id}`);
  }

  // Rejoindre la "room" d'un club
  @SubscribeMessage('joinClub')
  async handleJoinClub(
    @MessageBody() data: { clubId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { clubId, userId } = data;

    // Vérifier que l'utilisateur est membre du club
    const isMember = await this.messagesService.isUserMemberOfClub(
      clubId,
      userId,
    );

    if (!isMember) {
      client.emit('error', {
        message: 'Vous devez être membre pour rejoindre ce salon',
      });
      return;
    }

    // Joindre la room du club
    client.join(clubId);
    console.log(`👤 User ${userId} a rejoint la room ${clubId}`);

    // Charger et envoyer l'historique des messages
    const messages = await this.messagesService.findByClub(clubId);
    client.emit('messageHistory', messages);
  }

  // Envoyer un message
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: { clubId: string; userId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { clubId, userId, content } = data;

    try {
      // Créer le message dans la DB
      const message = await this.messagesService.create(
        clubId,
        userId,
        content,
      );

      // Diffuser le message à TOUS les membres du club (room)
      this.server.to(clubId).emit('newMessage', message);

      console.log(`💬 Message envoyé dans ${clubId} par ${userId}: ${content}`);
    } catch (error) {
      client.emit('error', {
        message: error.message || "Erreur lors de l'envoi du message",
      });
    }
  }

  // Quitter la "room" d'un club
  @SubscribeMessage('leaveClub')
  handleLeaveClub(
    @MessageBody() data: { clubId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { clubId } = data;
    client.leave(clubId);
    console.log(`👤 Client ${client.id} a quitté la room ${clubId}`);
  }
}
