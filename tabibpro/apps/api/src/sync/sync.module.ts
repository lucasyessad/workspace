// ============================================================
// TabibPro — Module Synchronisation Offline
// Critique pour l'Algérie (zones à connectivité limitée)
// ============================================================

import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncEngineService } from './sync-engine.service';
import { ConflictResolverService } from './conflict-resolver.service';
import { QueueOfflineService } from './queue-offline.service';

@Module({
  controllers: [SyncController],
  providers: [
    SyncEngineService,
    ConflictResolverService,
    QueueOfflineService,
  ],
  exports: [SyncEngineService, QueueOfflineService],
})
export class SyncModule {}
