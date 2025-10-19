import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from './entities/report.entity';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createReportDto: CreateReportDto) {
    const reporterId = req.user.id;
    return await this.reportsService.create(reporterId, createReportDto);
  }

  @Get()
  async findAll() {
    return await this.reportsService.findAll();
  }

  @Get('user/:userId')
  async findByReportedUser(@Param('userId') userId: string) {
    return await this.reportsService.findByReportedUser(userId);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: ReportStatus) {
    return await this.reportsService.findByStatus(status);
  }
}
