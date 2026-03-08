// ============================================================
// TabibPro — Module racine NestJS
// ============================================================

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

// Modules fonctionnels
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { OrdonnancesModule } from './ordonnances/ordonnances.module';
import { MedicamentsModule } from './medicaments/medicaments.module';
import { DocumentsModule } from './documents/documents.module';
import { VaccinationsModule } from './vaccinations/vaccinations.module';
import { StockModule } from './stock/stock.module';
import { FacturationModule } from './facturation/facturation.module';
import { RdvModule } from './rdv/rdv.module';
import { MessagerieModule } from './messagerie/messagerie.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { AlgeriaModule } from './algeria/algeria.module';
import { SyncModule } from './sync/sync.module';
import { PdfModule } from './pdf/pdf.module';
import { ScannerModule } from './scanner/scanner.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { I18nModule } from './i18n/i18n.module';

// Middleware
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { LocaleMiddleware } from './common/middleware/locale.middleware';

@Module({
  imports: [
    // ---- Configuration ----
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      expandVariables: true,
    }),

    // ---- Rate Limiting ----
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('RATE_LIMIT_TTL', 60) * 1000,
          limit: config.get('RATE_LIMIT_MAX', 100),
        },
      ],
    }),

    // ---- Queue (BullMQ) ----
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
    }),

    // ---- Tâches planifiées ----
    ScheduleModule.forRoot(),

    // ---- Base de données ----
    DatabaseModule,

    // ---- Internationalisation ----
    I18nModule,

    // ---- Modules fonctionnels ----
    AuthModule,
    PatientsModule,
    ConsultationsModule,
    OrdonnancesModule,
    MedicamentsModule,
    DocumentsModule,
    VaccinationsModule,
    StockModule,
    FacturationModule,
    RdvModule,
    MessagerieModule,
    NotificationsModule,
    AiModule,
    AlgeriaModule,
    SyncModule,
    PdfModule,
    ScannerModule,
    AnalyticsModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware, LocaleMiddleware)
      .forRoutes('*');
  }
}
