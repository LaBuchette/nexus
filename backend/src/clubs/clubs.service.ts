import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { Club } from './entities/club.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createClubDto: CreateClubDto, ownerId: string): Promise<Club> {
    // Vérifier que l'utilisateur existe
    const owner = await this.userRepository.findOne({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Créer le club
    const club = this.clubRepository.create({
      ...createClubDto,
      ownerId: ownerId,
      memberCount: 1, // Le owner est le premier membre
    });

    return await this.clubRepository.save(club);
  }

  async findAll(): Promise<Club[]> {
    return await this.clubRepository.find({
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!club) {
      throw new NotFoundException(`Club avec l'ID ${id} non trouvé`);
    }

    return club;
  }

  async update(
    id: string,
    updateClubDto: UpdateClubDto,
    userId: string,
  ): Promise<Club> {
    const club = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    if (club.ownerId !== userId) {
      throw new ForbiddenException(
        'Seul le propriétaire peut modifier le club',
      );
    }

    // Mettre à jour le club
    Object.assign(club, updateClubDto);
    return await this.clubRepository.save(club);
  }

  async remove(id: string, userId: string): Promise<void> {
    const club = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    if (club.ownerId !== userId) {
      throw new ForbiddenException(
        'Seul le propriétaire peut supprimer le club',
      );
    }

    await this.clubRepository.remove(club);
  }

  async findByOwner(ownerId: string): Promise<Club[]> {
    return await this.clubRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }
}
