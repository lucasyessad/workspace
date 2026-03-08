import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { OrdonnancesModule } from '../ordonnances/ordonnances.module';

@Module({
  imports: [OrdonnancesModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
