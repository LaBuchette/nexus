import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FriendRequest,
  FriendRequestStatus,
} from './entities/friend-request.entity';
import { BlocksService } from '../blocks/blocks.service';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
    private blocksService: BlocksService,
  ) {}

  // Envoyer une demande d'ami
  async sendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<FriendRequest> {
    // Vérifier qu'on ne s'envoie pas une demande à soi-même
    if (senderId === receiverId) {
      throw new BadRequestException(
        'Vous ne pouvez pas vous ajouter vous-même',
      );
    }

    // NOUVEAU : Vérifier les blocages (dans les 2 sens)
    const isBlocked = await this.blocksService.isBlockedBidirectional(
      senderId,
      receiverId,
    );

    if (isBlocked) {
      throw new BadRequestException(
        "Impossible d'envoyer une demande à cet utilisateur",
      );
    }

    // Vérifier s'il existe déjà une demande en attente (dans les 2 sens)
    const existingRequest = await this.friendRequestRepository.findOne({
      where: [
        { senderId, receiverId, status: FriendRequestStatus.PENDING },
        {
          senderId: receiverId,
          receiverId: senderId,
          status: FriendRequestStatus.PENDING,
        },
      ],
    });

    if (existingRequest) {
      throw new ConflictException('Une demande est déjà en attente');
    }

    // Vérifier s'ils sont déjà amis
    const existingFriendship = await this.friendRequestRepository.findOne({
      where: [
        { senderId, receiverId, status: FriendRequestStatus.ACCEPTED },
        {
          senderId: receiverId,
          receiverId: senderId,
          status: FriendRequestStatus.ACCEPTED,
        },
      ],
    });

    if (existingFriendship) {
      throw new ConflictException('Vous êtes déjà amis');
    }

    // Créer la demande
    const request = this.friendRequestRepository.create({
      senderId,
      receiverId,
      status: FriendRequestStatus.PENDING,
    });

    return await this.friendRequestRepository.save(request);
  }

  // Accepter une demande
  async acceptRequest(
    requestId: string,
    userId: string,
  ): Promise<FriendRequest> {
    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande non trouvée');
    }

    // Vérifier que c'est bien le destinataire qui accepte
    if (request.receiverId !== userId) {
      throw new BadRequestException(
        'Vous ne pouvez accepter que vos propres demandes',
      );
    }

    // Vérifier que la demande est en attente
    if (request.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    // NOUVEAU : Vérifier les blocages avant d'accepter
    const isBlocked = await this.blocksService.isBlockedBidirectional(
      request.senderId,
      request.receiverId,
    );

    if (isBlocked) {
      throw new BadRequestException(
        "Impossible d'accepter cette demande car un blocage existe",
      );
    }

    // Accepter
    request.status = FriendRequestStatus.ACCEPTED;
    return await this.friendRequestRepository.save(request);
  }

  // Refuser une demande
  async rejectRequest(requestId: string, userId: string): Promise<void> {
    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande non trouvée');
    }

    // Vérifier que c'est bien le destinataire qui refuse
    if (request.receiverId !== userId) {
      throw new BadRequestException(
        'Vous ne pouvez refuser que vos propres demandes',
      );
    }

    // Vérifier que la demande est en attente
    if (request.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    // Refuser (ou supprimer)
    await this.friendRequestRepository.remove(request);
  }

  // Récupérer mes amis (status = accepted)
  async getFriends(userId: string): Promise<FriendRequest[]> {
    return await this.friendRequestRepository.find({
      where: [
        { senderId: userId, status: FriendRequestStatus.ACCEPTED },
        { receiverId: userId, status: FriendRequestStatus.ACCEPTED },
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  // Récupérer les demandes reçues en attente
  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    return await this.friendRequestRepository.find({
      where: {
        receiverId: userId,
        status: FriendRequestStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Récupérer les demandes envoyées en attente
  async getSentRequests(userId: string): Promise<FriendRequest[]> {
    return await this.friendRequestRepository.find({
      where: {
        senderId: userId,
        status: FriendRequestStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Vérifier si deux utilisateurs sont amis
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.friendRequestRepository.findOne({
      where: [
        {
          senderId: userId1,
          receiverId: userId2,
          status: FriendRequestStatus.ACCEPTED,
        },
        {
          senderId: userId2,
          receiverId: userId1,
          status: FriendRequestStatus.ACCEPTED,
        },
      ],
    });

    return !!friendship;
  }
}
