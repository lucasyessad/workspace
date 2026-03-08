// ============================================================
// TabibPro — Service IA Principal
// Orchestrateur des 7 fonctions IA + darija
// ============================================================

import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiagnosticProvider, DiagnosticRequest, DiagnosticSuggestion } from './providers/diagnostic.provider';
import { DarijaTranslatorProvider } from './providers/darija.provider';
import { AnonymisationService } from './anonymisation.service';
import { AuditIaService } from './audit-ia.service';
import type { DarijaTranslationResult } from '@tabibpro/shared';

export interface AiContext {
  medecinId: string;
  patientId: string;
  consultationId?: string;
  locale?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly diagnosticProvider: DiagnosticProvider,
    private readonly darijaProvider: DarijaTranslatorProvider,
    private readonly anonymisationService: AnonymisationService,
    private readonly auditIaService: AuditIaService
  ) {}

  private isIaEnabled(): boolean {
    return this.config.get<boolean>('AI_ENABLED', true);
  }

  /**
   * Vérifie que l'IA est activée et que le budget n'est pas dépassé.
   */
  private async checkBudget(medecinId: string): Promise<void> {
    if (!this.isIaEnabled()) {
      throw new ForbiddenException("L'IA est désactivée sur ce serveur.");
    }
    const used = await this.auditIaService.getTokensUsedToday(medecinId);
    const maxTokens = this.config.get<number>('AI_MAX_TOKENS_PER_SESSION', 50000);
    if (used > maxTokens) {
      throw new ForbiddenException(
        `Budget IA journalier atteint (${used} tokens utilisés). Réessayez demain.`
      );
    }
  }

  // ---- 1. Aide au diagnostic ----

  async suggestDiagnostic(
    request: DiagnosticRequest,
    context: AiContext
  ): Promise<DiagnosticSuggestion> {
    await this.checkBudget(context.medecinId);

    // Anonymiser avant d'envoyer à l'IA
    const anonymizedRequest = this.anonymisationService.anonymize(request);

    const suggestion = await this.diagnosticProvider.suggestDiagnostic(
      anonymizedRequest as DiagnosticRequest,
      context.locale
    );

    // Journaliser la suggestion
    await this.auditIaService.logSuggestion({
      ...context,
      typeRequete: 'DIAGNOSTIC',
      promptEnvoye: JSON.stringify(anonymizedRequest),
      reponseRecue: JSON.stringify(suggestion),
      tokensUtilises: suggestion.tokensUtilises || 0,
      modeleUtilise: this.config.get('AI_MODEL_DEEP', 'claude-opus-4-6'),
    });

    return suggestion;
  }

  // ---- 2. Interactions médicamenteuses ----

  async checkInteractions(
    medicaments: Array<{ nom: string; dci?: string }>,
    context: AiContext
  ) {
    await this.checkBudget(context.medecinId);
    return this.diagnosticProvider.analyzeInteractions(medicaments);
  }

  // ---- 3. Traduction darija algérien ----

  async translateDarija(
    message: string,
    context: Omit<AiContext, 'patientId'> & { patientId?: string }
  ): Promise<DarijaTranslationResult | null> {
    if (!this.isIaEnabled()) return null;

    const result = await this.darijaProvider.detectAndTranslate(message);

    if (result) {
      await this.auditIaService.logSuggestion({
        medecinId: context.medecinId,
        patientId: context.patientId || '',
        consultationId: context.consultationId,
        typeRequete: 'DARIJA_TRADUCTION',
        promptEnvoye: `[DARIJA] ${message.substring(0, 100)}...`,
        reponseRecue: JSON.stringify(result),
        tokensUtilises: 0,
        modeleUtilise: this.config.get('AI_MODEL_FAST', 'claude-sonnet-4-6'),
      });
    }

    return result;
  }

  // ---- 4. Simplification pour le patient ----

  async simplifyForPatient(
    texteMedial: string,
    languePatient: 'fr' | 'ar' | 'ber' = 'fr'
  ): Promise<string> {
    if (!this.isIaEnabled()) return texteMedial;
    return this.darijaProvider.simplifyForPatient(texteMedial, languePatient);
  }
}
