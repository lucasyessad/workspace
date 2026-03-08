// ============================================================
// TabibPro — Controller Médicaments
// Pharmacopée ANPP algérienne
// ============================================================

import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { MedicamentsService } from './medicaments.service';
import { SearchInteractionsDto } from './dto/medicaments.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('medicaments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicamentsController {
  constructor(private readonly service: MedicamentsService) {}

  // GET /medicaments?q=&wilaya=
  @Get()
  search(
    @Query('q') q?: string,
    @Query('wilaya') wilaya?: string,
  ) {
    return this.service.search(q || '', wilaya);
  }

  // POST /medicaments/interactions — body: { ids: string[] }
  @Post('interactions')
  searchInteractions(@Body() dto: SearchInteractionsDto) {
    return this.service.searchInteractions(dto.ids);
  }

  // GET /medicaments/:id/generiques
  @Get(':id/generiques')
  getGeneriques(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getGeneriques(id);
  }

  // GET /medicaments/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
}
