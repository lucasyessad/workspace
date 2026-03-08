// ============================================================
// TabibPro — Prisma Client — DB Service (users, auth, sessions)
// ============================================================

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@tabibpro/db-service';

@Injectable()
export class PrismaServiceService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaServiceService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ DB Service connectée');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
