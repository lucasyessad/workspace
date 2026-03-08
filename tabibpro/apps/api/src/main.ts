// ============================================================
// TabibPro — Point d'entrée API NestJS
// ============================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import compression from 'compression';
import { pino } from 'pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard' },
  },
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV', 'production');
  const port = configService.get<number>('PORT', 3001);
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '').split(',');

  // ---- Sécurité ----
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true },
    })
  );
  app.use(compression());

  // ---- CORS ----
  app.enableCors({
    origin: nodeEnv === 'development' ? true : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-Device-Id'],
  });

  // ---- Versioning API ----
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');

  // ---- Validation globale ----
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
    })
  );

  // ---- WebSocket ----
  app.useWebSocketAdapter(new IoAdapter(app));

  // ---- Filtres & intercepteurs globaux ----
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new AuditInterceptor(),
  );

  // ---- Swagger (doc auto) ----
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('TabibPro API')
      .setDescription(
        'API REST — Logiciel de gestion médicale TabibPro\n\n' +
          '**Adapté au contexte algérien** : CNAS, pharmacopée DZ, darija, Loi 18-07\n\n' +
          'Quatre langues : Français | العربية | ⵜⴰⵎⴰⵣⵉⵖⵜ | English'
      )
      .setVersion('1.0')
      .setContact('Support TabibPro', 'https://tabibpro.dz', 'support@tabibpro.dz')
      .setLicense('Propriétaire', 'https://tabibpro.dz/licence')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .addTag('auth', 'Authentification & MFA')
      .addTag('patients', 'Gestion des patients')
      .addTag('consultations', 'Consultations médicales')
      .addTag('ordonnances', 'Ordonnances (format algérien)')
      .addTag('pharmacopee', 'Pharmacopée algérienne (ANPP)')
      .addTag('stock', 'Stock médicaments cabinet')
      .addTag('rdv', 'Rendez-vous & planning')
      .addTag('messagerie', 'Messagerie (avec darija)')
      .addTag('ia', 'Intelligence Artificielle médicale')
      .addTag('facturation', 'Facturation DZD & CNAS')
      .addTag('documents', 'Documents & OCR bilingue')
      .addTag('vaccinations', 'Vaccinations (calendrier DZ)')
      .addTag('algeria', 'Référentiels algériens (wilayas, CNAS, etc.)')
      .addTag('sync', 'Synchronisation offline')
      .addTag('analytics', 'Rapports & statistiques')
      .addTag('health', 'Health check')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    logger.info(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);

  logger.info(`
╔═══════════════════════════════════════════════╗
║         🏥 TabibPro — API v1.0             ║
║         Édition Algérie                        ║
╠═══════════════════════════════════════════════╣
║  URL      : http://localhost:${port}               ║
║  Env      : ${nodeEnv.padEnd(35)}║
║  Timezone : Africa/Algiers (UTC+1)             ║
║  Currency : DZD (Dinar Algérien)               ║
║  Langues  : FR | AR | BER | EN                ║
╚═══════════════════════════════════════════════╝
  `);
}

bootstrap().catch((err) => {
  logger.error('Erreur critique au démarrage de l\'API:', err);
  process.exit(1);
});
