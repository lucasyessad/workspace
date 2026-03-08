import { Controller, Get, Param, Res, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('ordonnance/:id')
  async getOrdonnancePdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.genererOrdonnancePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ordonnance-${id.substring(0, 8)}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
