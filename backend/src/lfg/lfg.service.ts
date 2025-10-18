import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LFGPost } from './entities/lfg-post.entity';

@Injectable()
export class LfgService {
  constructor(
    @InjectRepository(LFGPost)
    private lfgRepository: Repository<LFGPost>,
  ) {}

  // Créer une annonce LFG
  async create(
    title: string,
    description: string,
    game: string,
    playersNeeded: number,
    creatorId: string,
    clubId: string,
  ): Promise<LFGPost> {
    const lfgPost = this.lfgRepository.create({
      title,
      description,
      game,
      playersNeeded,
      creatorId,
      clubId,
    });

    return await this.lfgRepository.save(lfgPost);
  }

  // Récupérer toutes les annonces
  async findAll(): Promise<LFGPost[]> {
    return await this.lfgRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['creator', 'club'],
    });
  }

  // Récupérer les annonces d'un club spécifique
  async findByClub(clubId: string): Promise<LFGPost[]> {
    return await this.lfgRepository.find({
      where: { clubId },
      order: { createdAt: 'DESC' },
      relations: ['creator', 'club'],
    });
  }

  // Supprimer une annonce
  async remove(id: string, userId: string): Promise<void> {
    const lfgPost = await this.lfgRepository.findOne({
      where: { id },
    });

    if (!lfgPost) {
      throw new NotFoundException('Annonce LFG non trouvée');
    }

    // Vérifier que c'est le créateur qui supprime
    if (lfgPost.creatorId !== userId) {
      throw new NotFoundException(
        'Vous ne pouvez supprimer que vos propres annonces',
      );
    }

    await this.lfgRepository.remove(lfgPost);
  }
}
