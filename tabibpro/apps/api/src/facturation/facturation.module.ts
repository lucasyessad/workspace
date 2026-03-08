// ============================================================
// TabibPro — Module Facturation
// ============================================================

import { Module } from '@nestjs/common';
import { FacturationController } from './facturation.controller';
import { FacturationService } from './facturation.service';

@Module({
  controllers: [FacturationController],
  providers: [FacturationService],
  exports: [FacturationService],
})
export class FacturationModule {}
