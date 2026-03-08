// ============================================================
// TabibPro — Controller Vaccinations
// Calendrier vaccinal PEV algérien
// ============================================================

import {
  Controller, Get, Post, Body, Param,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { VaccinationsService } from './vaccinations.service';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('vaccinations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MEDECIN')
export class VaccinationsController {
  constructor(private readonly service: VaccinationsService) {}

  // GET /vaccinations/retards
  @Get('retards')
  getRetards(@CurrentUser() user: JwtPayload) {
    return this.service.getRetards(user.medecinId!);
  }

  // GET /vaccinations/patient/:patientId
  @Get('patient/:patientId')
  getCalendrierPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.service.getCalendrierPatient(patientId);
  }

  // POST /vaccinations
  @Post()
  addVaccination(
    @Body() dto: CreateVaccinationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.addVaccination(dto, user.medecinId!);
  }
}
