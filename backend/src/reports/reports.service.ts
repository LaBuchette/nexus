import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    private usersService: UsersService,
  ) {}

  async create(
    reporterId: string,
    createReportDto: CreateReportDto,
  ): Promise<Report> {
    const { reportedUserId, reason, description } = createReportDto;

    // 1. Vérifier qu'on ne se signale pas soi-même
    if (reporterId === reportedUserId) {
      throw new BadRequestException(
        'Vous ne pouvez pas vous signaler vous-même',
      );
    }

    // 2. Vérifier que l'utilisateur signalé existe
    const reportedUser = await this.usersService.findOne(reportedUserId);
    if (!reportedUser) {
      throw new NotFoundException("L'utilisateur signalé n'existe pas");
    }

    // 3. Vérifier qu'on n'a pas déjà signalé cet utilisateur dans les dernières 24h
    const existingReport = await this.reportsRepository.findOne({
      where: {
        reporterId,
        reportedUserId,
        status: ReportStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });

    if (existingReport) {
      const hoursSinceReport =
        (Date.now() - existingReport.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceReport < 24) {
        throw new ConflictException(
          'Vous avez déjà signalé cet utilisateur. Veuillez attendre 24h avant de le signaler à nouveau.',
        );
      }
    }

    // 4. Créer le signalement
    const report = this.reportsRepository.create({
      reporterId,
      reportedUserId,
      reason,
      description,
      status: ReportStatus.PENDING,
    });

    return await this.reportsRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return await this.reportsRepository.find({
      relations: ['reporter', 'reportedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByReportedUser(reportedUserId: string): Promise<Report[]> {
    return await this.reportsRepository.find({
      where: { reportedUserId },
      relations: ['reporter', 'reportedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: ReportStatus): Promise<Report[]> {
    return await this.reportsRepository.find({
      where: { status },
      relations: ['reporter', 'reportedUser'],
      order: { createdAt: 'DESC' },
    });
  }
}
