// ============================================================
// TabibPro — Module Algérie
// Référentiels, CNAS, pharmacopée, calendrier algérien
// ============================================================

import { Module } from '@nestjs/common';
import { WilayasController } from './wilayas/wilayas.controller';
import { WilayasService } from './wilayas/wilayas.service';
import { CnasController } from './cnas/cnas.controller';
import { CnasService } from './cnas/cnas.service';
import { PharmacpeeController } from './pharmacopee/pharmacpee.controller';
import { PharmacpeeService } from './pharmacopee/pharmacpee.service';
import { NomenclatureController } from './nomenclature/nomenclature.controller';
import { NomenclatureService } from './nomenclature/nomenclature.service';
import { CalendrierService } from './calendrier/calendrier.service';

@Module({
  controllers: [
    WilayasController,
    CnasController,
    PharmacpeeController,
    NomenclatureController,
  ],
  providers: [
    WilayasService,
    CnasService,
    PharmacpeeService,
    NomenclatureService,
    CalendrierService,
  ],
  exports: [
    WilayasService,
    CalendrierService,
    PharmacpeeService,
    CnasService,
  ],
})
export class AlgeriaModule {}
