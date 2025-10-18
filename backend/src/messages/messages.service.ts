import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { ClubsService } from '../clubs/clubs.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private clubsService: ClubsService,
  ) {}

  // Créer un nouveau message
  async create(
    clubId: string,
    authorId: string,
    content: string,
  ): Promise<Message> {
    // Vérifier que l'utilisateur est membre du club
    const isMember = await this.clubsService.isUserMember(clubId, authorId);
    if (!isMember) {
      throw new ForbiddenException(
        'Vous devez être membre du club pour envoyer des messages',
      );
    }

    // Créer le message
    const message = this.messageRepository.create({
      content,
      authorId,
      clubId,
    });

    // Sauvegarder dans la DB
    const savedMessage = await this.messageRepository.save(message);

    // ✨ CORRECTION : Recharger le message avec la relation 'author'
    const messageWithAuthor = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['author'],
    });

    // Vérifier que le message a bien été rechargé
    if (!messageWithAuthor) {
      throw new Error('Erreur lors de la création du message');
    }

    return messageWithAuthor;
  }

  // Récupérer tous les messages d'un club
  async findByClub(clubId: string): Promise<Message[]> {
    // Vérifier que le club existe
    await this.clubsService.findOne(clubId);

    // Récupérer les messages, triés du plus ancien au plus récent
    return await this.messageRepository.find({
      where: { clubId },
      order: { createdAt: 'ASC' },
      relations: ['author'],
    });
  }

  // Vérifier si un utilisateur est membre d'un club
  async isUserMemberOfClub(clubId: string, userId: string): Promise<boolean> {
    return await this.clubsService.isUserMember(clubId, userId);
  }
}
