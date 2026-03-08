// ============================================================
// TabibPro — Moteur de Synchronisation Offline
// Stratégie : offline-first, sync à la reconnexion
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConflictResolverService } from './conflict-resolver.service';
import { QueueOfflineService } from './queue-offline.service';
import type { SyncItem, SyncStatus } from '@tabibpro/shared';

export interface SyncPushPayload {
  deviceId: string;
  userId: string;
  items: SyncItem[];
  lastSyncAt?: string;
}

export interface SyncPullResponse {
  items: SyncItem[];
  timestamp: string;
  pendingConflicts: SyncItem[];
}

@Injectable()
export class SyncEngineService {
  private readonly logger = new Logger(SyncEngineService.name);

  constructor(
    private readonly conflictResolver: ConflictResolverService,
    private readonly queueOffline: QueueOfflineService
  ) {}

  /**
   * Synchronisation à la reconnexion :
   * 1. Envoyer les modifications locales vers le serveur
   * 2. Récupérer les modifications distantes
   * 3. Résoudre les conflits
   * 4. Envoyer les messages en attente
   * 5. Traiter les notifications différées
   * 6. Mettre à jour la base de connaissances IA
   */
  async syncOnReconnection(deviceId: string, userId: string): Promise<void> {
    this.logger.log(`Synchronisation en cours pour device:${deviceId.substring(0, 8)}...`);

    try {
      // 1. Traiter les messages en file d'attente
      await this.queueOffline.processMessageQueue(userId);

      // 2. Traiter les notifications différées
      await this.queueOffline.processNotificationQueue(userId);

      // 3. Traiter les opérations DB en attente
      const pendingOps = await this.queueOffline.getPendingOperations(deviceId);
      for (const op of pendingOps) {
        await this.applyOperation(op);
      }

      this.logger.log(`Synchronisation terminée — ${pendingOps.length} opérations traitées`);
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation:', error);
      throw error;
    }
  }

  /**
   * Reçoit les modifications envoyées par le client offline.
   */
  async pushFromClient(payload: SyncPushPayload): Promise<{
    accepted: string[];
    conflicts: SyncItem[];
    errors: Array<{ id: string; error: string }>;
  }> {
    const accepted: string[] = [];
    const conflicts: SyncItem[] = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (const item of payload.items) {
      try {
        const conflict = await this.conflictResolver.checkConflict(item);
        if (conflict) {
          conflicts.push(item);
        } else {
          await this.applyOperation(item);
          accepted.push(item.id);
        }
      } catch (error) {
        errors.push({ id: item.id, error: String(error) });
      }
    }

    return { accepted, conflicts, errors };
  }

  /**
   * Envoie les modifications récentes au client.
   */
  async pullForClient(
    deviceId: string,
    lastSyncAt?: string
  ): Promise<SyncPullResponse> {
    const since = lastSyncAt ? new Date(lastSyncAt) : new Date(0);
    // TODO: Récupérer les modifications depuis la DB depuis `since`
    return {
      items: [],
      timestamp: new Date().toISOString(),
      pendingConflicts: [],
    };
  }

  /**
   * Statut de synchronisation pour le header de l'interface.
   */
  async getSyncStatus(deviceId: string, userId: string): Promise<SyncStatus> {
    const pendingItems = await this.queueOffline.countPendingItems(deviceId);
    return {
      pendingItems,
      lastSyncAt: undefined,
      isOnline: true,
      isSyncing: false,
    };
  }

  private async applyOperation(item: SyncItem): Promise<void> {
    // TODO: Router l'opération vers le bon service selon item.table
    this.logger.debug(`Appliquer opération: ${item.operation} sur ${item.table}/${item.id}`);
  }
}
