// ============================================================
// TabibPro — Prisma Client — DB Médicale (locale obligatoire)
// Données sensibles — jamais en cloud — Loi 18-07
// ============================================================

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@tabibpro/db-medical';

@Injectable()
export class PrismaMedicalService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaMedicalService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ DB Médicale connectée (locale — données protégées Loi 18-07)');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('DB Médicale déconnectée');
  }
}
