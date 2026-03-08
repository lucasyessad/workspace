// ============================================================
// TabibPro — Controller Analytics
// Statistiques cabinet médical
// ============================================================

import {
  Controller, Get, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MEDECIN')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  // GET /analytics/dashboard?periode=mois
  @Get('dashboard')
  getDashboardStats(
    @CurrentUser() user: JwtPayload,
    @Query('periode') periode?: string,
  ) {
    const periodeValide = (['jour', 'semaine', 'mois', 'annee'].includes(periode as string)
      ? periode
      : 'mois') as 'jour' | 'semaine' | 'mois' | 'annee';
    return this.service.getDashboardStats(user.medecinId!, periodeValide);
  }

  // GET /analytics/diagnostics?limit=10
  @Get('diagnostics')
  getTopDiagnostics(
    @CurrentUser() user: JwtPayload,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.service.getTopDiagnostics(user.medecinId!, limit);
  }

  // GET /analytics/evolution?annee=2026
  @Get('evolution')
  getEvolutionMensuelle(
    @CurrentUser() user: JwtPayload,
    @Query('annee', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) annee: number,
  ) {
    return this.service.getEvolutionMensuelle(user.medecinId!, annee);
  }
}
