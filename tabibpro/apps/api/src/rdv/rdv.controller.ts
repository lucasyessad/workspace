import {
  Controller, Get, Post, Body, Query, Param,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { RdvService } from './rdv.service';
import { CreateRdvDto, AgendaQueryDto } from './dto/create-rdv.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('rdv')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RdvController {
  constructor(private readonly rdvService: RdvService) {}

  @Post()
  @Roles('MEDECIN', 'SECRETAIRE')
  create(@Body() dto: CreateRdvDto, @CurrentUser() user: JwtPayload) {
    return this.rdvService.create(dto, user.medecinId!);
  }

  @Get('agenda')
  @Roles('MEDECIN', 'SECRETAIRE')
  getAgenda(@CurrentUser() user: JwtPayload, @Query() query: AgendaQueryDto) {
    return this.rdvService.getAgenda(user.medecinId!, query);
  }

  @Get('file-attente')
  @Roles('MEDECIN', 'SECRETAIRE')
  getFileAttente(@CurrentUser() user: JwtPayload) {
    return { patients: this.rdvService.getFileAttente(user.medecinId!) };
  }

  @Post('file-attente/arrivee/:patientId')
  @Roles('MEDECIN', 'SECRETAIRE')
  arriverPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser() user: JwtPayload,
    @Body('priorite') priorite?: 'NORMAL' | 'URGENT',
  ) {
    return this.rdvService.arriverPatient(patientId, user.medecinId!, priorite);
  }

  @Post('file-attente/appeler-suivant')
  @Roles('MEDECIN')
  appellerSuivant(@CurrentUser() user: JwtPayload) {
    return this.rdvService.appellerSuivant(user.medecinId!);
  }
}
