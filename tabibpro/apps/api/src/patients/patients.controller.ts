import {
  Controller, Get, Post, Put, Patch, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto, SearchPatientDto } from './dto/create-patient.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MEDECIN', 'SECRETAIRE')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(@Body() dto: CreatePatientDto, @CurrentUser() user: JwtPayload) {
    return this.patientsService.create(dto, user.medecinId!);
  }

  @Get()
  search(@Query() query: SearchPatientDto, @CurrentUser() user: JwtPayload) {
    return this.patientsService.search(query, user.medecinId!);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.patientsService.update(id, dto, user.medecinId!);
  }

  @Patch(':id/archive')
  archive(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.patientsService.archive(id, user.medecinId!);
  }
}
