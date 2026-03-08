// ============================================================
// TabibPro — Controller Stock Cabinet
// ============================================================

import {
  Controller, Get, Post, Body,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateMouvementStockDto } from './dto/create-mouvement-stock.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MEDECIN')
export class StockController {
  constructor(private readonly service: StockService) {}

  // GET /stock
  @Get()
  getStock(@CurrentUser() user: JwtPayload) {
    return this.service.getStock(user.medecinId!);
  }

  // GET /stock/alertes
  @Get('alertes')
  getAlertes(@CurrentUser() user: JwtPayload) {
    return this.service.getAlertes(user.medecinId!);
  }

  // GET /stock/stats
  @Get('stats')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.service.getStats(user.medecinId!);
  }

  // POST /stock/mouvement
  @Post('mouvement')
  addMouvement(
    @Body() dto: CreateMouvementStockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.addMouvement(dto, user.medecinId!);
  }
}
