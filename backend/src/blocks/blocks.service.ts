import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import {
  FriendRequest,
  FriendRequestStatus,
} from '../friends/entities/friend-request.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
  ) {}

  // Bloquer un utilisateur
  async blockUser(
    blockerId: string,
    blockedId: string,
    reason?: string,
  ): Promise<Block> {
    // Vérifier qu'on ne se bloque pas soi-même
    if (blockerId === blockedId) {
      throw new BadRequestException(
        'Vous ne pouvez pas vous bloquer vous-même',
      );
    }

    // Vérifier si le blocage existe déjà
    const existingBlock = await this.blockRepository.findOne({
      where: { blockerId, blockedId },
    });

    if (existingBlock) {
      throw new ConflictException('Cet utilisateur est déjà bloqué');
    }

    // NOUVEAU : Supprimer l'amitié si elle existe (dans les 2 sens)
    await this.friendRequestRepository.delete({
      senderId: blockerId,
      receiverId: blockedId,
      status: FriendRequestStatus.ACCEPTED,
    });

    await this.friendRequestRepository.delete({
      senderId: blockedId,
      receiverId: blockerId,
      status: FriendRequestStatus.ACCEPTED,
    });

    // NOUVEAU : Supprimer aussi les demandes en attente (optionnel mais propre)
    await this.friendRequestRepository.delete({
      senderId: blockerId,
      receiverId: blockedId,
      status: FriendRequestStatus.PENDING,
    });

    await this.friendRequestRepository.delete({
      senderId: blockedId,
      receiverId: blockerId,
      status: FriendRequestStatus.PENDING,
    });

    // Créer le blocage
    const block = this.blockRepository.create({
      blockerId,
      blockedId,
      reason: reason || null,
    });

    return await this.blockRepository.save(block);
  }

  // Débloquer un utilisateur
  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const block = await this.blockRepository.findOne({
      where: { blockerId, blockedId },
    });

    if (!block) {
      throw new NotFoundException("Ce blocage n'existe pas");
    }

    await this.blockRepository.remove(block);
  }

  // Récupérer la liste des utilisateurs bloqués
  async getBlockedUsers(blockerId: string): Promise<Block[]> {
    return await this.blockRepository.find({
      where: { blockerId },
      order: { createdAt: 'DESC' },
    });
  }

  // Vérifier si un utilisateur en a bloqué un autre
  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await this.blockRepository.findOne({
      where: { blockerId, blockedId },
    });

    return !!block;
  }

  // Vérifier si deux utilisateurs se sont bloqués mutuellement (dans un sens ou l'autre)
  async isBlockedBidirectional(
    userId1: string,
    userId2: string,
  ): Promise<boolean> {
    const block1 = await this.isBlocked(userId1, userId2);
    const block2 = await this.isBlocked(userId2, userId1);

    return block1 || block2;
  }

  // Récupérer les utilisateurs qui m'ont bloqué (pour debug/admin)
  async getBlockers(blockedId: string): Promise<Block[]> {
    return await this.blockRepository.find({
      where: { blockedId },
      order: { createdAt: 'DESC' },
    });
  }

  // Supprimer tous les blocages liés à un utilisateur (si suppression de compte)
  async deleteAllBlocksForUser(userId: string): Promise<void> {
    await this.blockRepository.delete({ blockerId: userId });
    await this.blockRepository.delete({ blockedId: userId });
  }
}
