import { Module } from '@nestjs/common';
import { OrdonnancesController } from './ordonnances.controller';
import { OrdonnancesService } from './ordonnances.service';

@Module({
  controllers: [OrdonnancesController],
  providers: [OrdonnancesService],
  exports: [OrdonnancesService],
})
export class OrdonnancesModule {}
