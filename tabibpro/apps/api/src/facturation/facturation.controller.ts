// ============================================================
// TabibPro — Controller Facturation
// Facturation DZD — Tiers payant CNAS/CASNOS
// ============================================================

import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { CreateFactureDto, MarquerPayeeDto } from './dto/create-facture.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('facturation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MEDECIN')
export class FacturationController {
  constructor(private readonly service: FacturationService) {}

  // POST /facturation
  @Post()
  createFacture(
    @Body() dto: CreateFactureDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createFacture(dto, user.medecinId!);
  }

  // GET /facturation/patient/:patientId
  @Get('patient/:patientId')
  findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.service.findByPatient(patientId);
  }

  // GET /facturation/stats?mois=YYYY-MM
  @Get('stats')
  getStats(
    @CurrentUser() user: JwtPayload,
    @Query('mois') mois?: string,
  ) {
    return this.service.getStats(user.medecinId!, mois);
  }

  // PATCH /facturation/:id/payer — body: { modeReglement }
  @Patch(':id/payer')
  marquerPayee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarquerPayeeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.marquerPayee(id, dto.modeReglement, user.medecinId!);
  }
}
