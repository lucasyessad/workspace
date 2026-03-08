// ============================================================
// TabibPro — File d'Attente Offline
// Messages et notifications différés pendant déconnexion
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import type { SyncItem } from '@tabibpro/shared';

@Injectable()
export class QueueOfflineService {
  private readonly logger = new Logger(QueueOfflineService.name);

  async processMessageQueue(userId: string): Promise<number> {
    // TODO: Récupérer et envoyer les messages en attente depuis la DB
    this.logger.debug(`Traitement file d'attente messages pour user:${userId.substring(0, 8)}...`);
    return 0;
  }

  async processNotificationQueue(userId: string): Promise<number> {
    // TODO: Envoyer les notifications SMS/email différées
    this.logger.debug(`Traitement file d'attente notifications pour user:${userId.substring(0, 8)}...`);
    return 0;
  }

  async getPendingOperations(deviceId: string): Promise<SyncItem[]> {
    // TODO: Récupérer les opérations DB en attente depuis sync_queue
    return [];
  }

  async countPendingItems(deviceId: string): Promise<number> {
    const items = await this.getPendingOperations(deviceId);
    return items.length;
  }

  async enqueue(deviceId: string, userId: string, item: SyncItem): Promise<void> {
    // TODO: Persister dans sync_queue
    this.logger.debug(`Mise en file d'attente: ${item.operation} sur ${item.table}/${item.id}`);
  }

  async markAsSynced(itemId: string): Promise<void> {
    // TODO: Marquer comme synchronisé dans sync_queue
    this.logger.debug(`Marqué comme synchronisé: ${itemId.substring(0, 8)}...`);
  }
}
