// ============================================================
// TabibPro — Audit IA — Journal de traçabilité complet
// Conformité réglementaire — Algérie
// ============================================================

import { Injectable, Logger } from '@nestjs/common';

export interface AuditIaEntry {
  medecinId: string;
  patientId: string;
  consultationId?: string;
  typeRequete: string;
  promptEnvoye: string;
  reponseRecue: string;
  tokensUtilises: number;
  modeleUtilise: string;
}

@Injectable()
export class AuditIaService {
  private readonly logger = new Logger(AuditIaService.name);
  // En production, ceci est persisté en DB médicale locale
  private readonly dailyTokens = new Map<string, number>();

  async logSuggestion(entry: AuditIaEntry): Promise<void> {
    // Mettre à jour le compteur de tokens journalier
    const today = new Date().toISOString().split('T')[0];
    const key = `${entry.medecinId}:${today}`;
    const current = this.dailyTokens.get(key) || 0;
    this.dailyTokens.set(key, current + entry.tokensUtilises);

    this.logger.log(
      `IA Journal — Médecin:${entry.medecinId.substring(0, 8)}... | ` +
        `Type:${entry.typeRequete} | Tokens:${entry.tokensUtilises}`
    );

    // TODO: Persister en DB médicale locale (table suggestions_ia)
  }

  async getTokensUsedToday(medecinId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `${medecinId}:${today}`;
    return this.dailyTokens.get(key) || 0;
  }
}
