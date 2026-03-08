import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto, TerminerConsultationDto } from './dto/create-consultation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('consultations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MEDECIN')
export class ConsultationsController {
  constructor(private readonly service: ConsultationsService) {}

  @Post()
  create(@Body() dto: CreateConsultationDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.medecinId!);
  }

  @Get('patient/:patientId')
  findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findByPatient(patientId, page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/terminer')
  terminer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TerminerConsultationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.terminer(id, dto, user.medecinId!);
  }
}
