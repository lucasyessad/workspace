// ============================================================
// TabibPro — Module Médicaments
// Pharmacopée ANPP algérienne
// ============================================================

import { Module } from '@nestjs/common';
import { MedicamentsController } from './medicaments.controller';
import { MedicamentsService } from './medicaments.service';

@Module({
  controllers: [MedicamentsController],
  providers: [MedicamentsService],
  exports: [MedicamentsService],
})
export class MedicamentsModule {}
