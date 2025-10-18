import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { Club } from './entities/club.entity';
import { Member, MemberRole } from './entities/member.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
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

    const savedClub = await this.clubRepository.save(club);

    // Créer automatiquement le membre owner
    const ownerMember = this.memberRepository.create({
      userId: ownerId,
      clubId: savedClub.id,
      role: MemberRole.OWNER,
    });

    await this.memberRepository.save(ownerMember);

    return savedClub;
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
  // === MÉTHODES MEMBRES ===

  async joinClub(clubId: string, userId: string): Promise<Member> {
    // Vérifier que le club existe
    const club = await this.findOne(clubId);

    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMember = await this.memberRepository.findOne({
      where: { clubId, userId },
    });

    if (existingMember) {
      throw new ConflictException('Vous êtes déjà membre de ce club');
    }

    // Vérifier que le club n'est pas plein
    if (club.memberCount >= club.maxMembers) {
      throw new ConflictException('Le club est complet');
    }

    // Créer le membre
    const member = this.memberRepository.create({
      userId,
      clubId,
      role: MemberRole.MEMBER,
    });

    await this.memberRepository.save(member);

    // Incrémenter le nombre de membres
    club.memberCount += 1;
    await this.clubRepository.save(club);

    return member;
  }

  async leaveClub(clubId: string, userId: string): Promise<void> {
    // Vérifier que le club existe
    const club = await this.findOne(clubId);

    // Vérifier que l'utilisateur est membre
    const member = await this.memberRepository.findOne({
      where: { clubId, userId },
    });

    if (!member) {
      throw new NotFoundException("Vous n'êtes pas membre de ce club");
    }

    // Empêcher le owner de quitter son propre club
    if (member.role === MemberRole.OWNER) {
      throw new ForbiddenException(
        'Le propriétaire ne peut pas quitter son club. Supprimez le club à la place.',
      );
    }

    // Supprimer le membre
    await this.memberRepository.remove(member);

    // Décrémenter le nombre de membres
    club.memberCount -= 1;
    await this.clubRepository.save(club);
  }

  async getClubMembers(clubId: string): Promise<Member[]> {
    return await this.memberRepository.find({
      where: { clubId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  async isUserMember(clubId: string, userId: string): Promise<boolean> {
    const member = await this.memberRepository.findOne({
      where: { clubId, userId },
    });

    return !!member;
  }

  async getUserClubs(userId: string): Promise<Club[]> {
    const members = await this.memberRepository.find({
      where: { userId },
      relations: ['club', 'club.owner'],
    });

    return members.map((member) => member.club);
  }
}
