// ============================================================
// TabibPro — Résolution de Conflits de Synchronisation
// Stratégie : last-write-wins avec possibilité de merge manuel
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import type { SyncItem } from '@tabibpro/shared';

export interface ConflictResolution {
  type: 'auto' | 'manual';
  winner: 'client' | 'server';
  mergedData?: Record<string, unknown>;
}

@Injectable()
export class ConflictResolverService {
  private readonly logger = new Logger(ConflictResolverService.name);

  /**
   * Vérifie si une modification en attente crée un conflit avec l'état serveur.
   * Conflit = le même enregistrement a été modifié côté serveur depuis la dernière sync.
   */
  async checkConflict(item: SyncItem): Promise<boolean> {
    // TODO: Vérifier en DB si l'enregistrement a été modifié après item.timestamp
    return false;
  }

  /**
   * Résolution automatique : last-write-wins par timestamp.
   * Pour les données médicales critiques (consultation, ordonnance),
   * on propose une résolution manuelle au médecin.
   */
  async resolveConflict(
    clientItem: SyncItem,
    serverItem: SyncItem,
    tableCritique: boolean = false
  ): Promise<ConflictResolution> {
    if (tableCritique) {
      // Tables médicales critiques : on demande une résolution manuelle
      this.logger.warn(
        `Conflit sur table critique ${clientItem.table}/${clientItem.id} — résolution manuelle requise`
      );
      return { type: 'manual', winner: 'server' };
    }

    // Stratégie last-write-wins
    const clientTime = new Date(clientItem.timestamp).getTime();
    const serverTime = new Date(serverItem.timestamp).getTime();

    if (clientTime > serverTime) {
      return { type: 'auto', winner: 'client' };
    }
    return { type: 'auto', winner: 'server' };
  }

  /**
   * Tables médicales critiques (conflit → résolution manuelle).
   */
  isCriticalTable(table: string): boolean {
    const criticalTables = [
      'consultations',
      'ordonnances',
      'lignes_ordonnances',
      'vaccinations',
      'suggestions_ia',
    ];
    return criticalTables.includes(table);
  }
}
