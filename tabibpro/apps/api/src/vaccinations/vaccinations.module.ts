// ============================================================
// TabibPro — Module Vaccinations
// Calendrier vaccinal PEV algérien
// ============================================================

import { Module } from '@nestjs/common';
import { VaccinationsController } from './vaccinations.controller';
import { VaccinationsService } from './vaccinations.service';

@Module({
  controllers: [VaccinationsController],
  providers: [VaccinationsService],
  exports: [VaccinationsService],
})
export class VaccinationsModule {}
