// ============================================================
// TabibPro — Module IA Médicale
// Intégration Claude API avec support darija algérien
// ============================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DiagnosticProvider } from './providers/diagnostic.provider';
import { InteractionsProvider } from './providers/interactions.provider';
import { LitteratureProvider } from './providers/litterature.provider';
import { AnalyseResultatsProvider } from './providers/analyse-resultats.provider';
import { ProtocolesProvider } from './providers/protocoles.provider';
import { RedactionProvider } from './providers/redaction.provider';
import { DicteeProvider } from './providers/dictee.provider';
import { DarijaTranslatorProvider } from './providers/darija.provider';
import { AnonymisationService } from './anonymisation.service';
import { AuditIaService } from './audit-ia.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    AiService,
    DiagnosticProvider,
    InteractionsProvider,
    LitteratureProvider,
    AnalyseResultatsProvider,
    ProtocolesProvider,
    RedactionProvider,
    DicteeProvider,
    DarijaTranslatorProvider,
    AnonymisationService,
    AuditIaService,
  ],
  exports: [
    AiService,
    DarijaTranslatorProvider,
    AnonymisationService,
  ],
})
export class AiModule {}
