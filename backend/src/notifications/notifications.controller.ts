import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /notifications - Toutes les notifications de l'utilisateur
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.id;
    return await this.notificationsService.findByUser(userId);
  }

  // GET /notifications/unread - Uniquement les non lues
  @Get('unread')
  async findUnread(@Request() req) {
    const userId = req.user.id;
    return await this.notificationsService.findUnreadByUser(userId);
  }

  // GET /notifications/count - Nombre de notifications non lues
  @Get('count')
  async countUnread(@Request() req) {
    const userId = req.user.id;
    const count = await this.notificationsService.countUnread(userId);
    return { count };
  }

  // PATCH /notifications/:id/read - Marquer UNE notification comme lue
  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    await this.notificationsService.markAsRead(id, userId);
  }

  // PATCH /notifications/read-all - Marquer TOUTES comme lues
  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(@Request() req) {
    const userId = req.user.id;
    await this.notificationsService.markAllAsRead(userId);
  }

  // DELETE /notifications/:id - Supprimer une notification
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    await this.notificationsService.remove(id, userId);
  }
}
