import { Injectable } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';

// TODO: Scanner documents — OCR bilingue
@Injectable()
export class ScannerService {
  constructor(private readonly prisma: PrismaMedicalService) {}
}
