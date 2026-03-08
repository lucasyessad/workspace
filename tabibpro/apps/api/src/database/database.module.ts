// ============================================================
// TabibPro — Module Base de Données
// Deux bases Prisma : médicale (locale) + service
// ============================================================

import { Module, Global } from '@nestjs/common';
import { PrismaMedicalService } from './prisma-medical.service';
import { PrismaServiceService } from './prisma-service.service';

@Global()
@Module({
  providers: [PrismaMedicalService, PrismaServiceService],
  exports: [PrismaMedicalService, PrismaServiceService],
})
export class DatabaseModule {}
