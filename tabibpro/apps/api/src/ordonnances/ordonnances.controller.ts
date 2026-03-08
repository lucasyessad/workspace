import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { OrdonnancesService } from './ordonnances.service';
import { CreateOrdonnanceDto } from './dto/create-ordonnance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('ordonnances')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MEDECIN')
export class OrdonnancesController {
  constructor(private readonly service: OrdonnancesService) {}

  @Post()
  create(@Body() dto: CreateOrdonnanceDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.medecinId!);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/valider')
  valider(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.valider(id, user.medecinId!);
  }
}
