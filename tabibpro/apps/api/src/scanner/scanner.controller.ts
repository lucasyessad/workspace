import { Controller, Get, UseGuards } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// TODO: Scanner documents — OCR bilingue
@Controller('scanner')
@UseGuards(JwtAuthGuard)
export class ScannerController {
  constructor(private readonly service: ScannerService) {}
}
