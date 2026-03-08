// ============================================================
// TabibPro — Controller Messagerie
// Messagerie sécurisée médecin-patient
// ============================================================

import {
  Controller, Get, Post, Patch, Body, Param,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { MessagerieService } from './messagerie.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('messagerie')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagerieController {
  constructor(private readonly service: MessagerieService) {}

  // GET /messagerie/conversations
  @Get('conversations')
  getConversations(@CurrentUser() user: JwtPayload) {
    const userId = user.medecinId ?? user.patientId ?? user.sub;
    return this.service.getConversations(userId, user.role);
  }

  // GET /messagerie/conversations/:id/messages
  @Get('conversations/:id/messages')
  getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.medecinId ?? user.patientId ?? user.sub;
    return this.service.getMessages(id, userId);
  }

  // POST /messagerie/envoyer
  @Post('envoyer')
  sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const senderId = user.medecinId ?? user.patientId ?? user.sub;
    return this.service.sendMessage(dto, senderId, user.role);
  }

  // PATCH /messagerie/conversations/:id/lu
  @Patch('conversations/:id/lu')
  marquerLu(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.medecinId ?? user.patientId ?? user.sub;
    return this.service.marquerLu(id, userId);
  }
}
