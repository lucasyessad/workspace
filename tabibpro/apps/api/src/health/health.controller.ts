import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaMedicalService } from '../database/prisma-medical.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prismaMedical: PrismaMedicalService) {}

  @Get()
  @Public()
  async check() {
    let dbStatus = 'ok';
    try {
      await this.prismaMedical.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        api: 'ok',
        db_medical: dbStatus,
      },
      version: process.env.npm_package_version || '1.0.0',
      env: process.env.NODE_ENV || 'development',
    };
  }
}
