import { Injectable } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';

// TODO: Documents patients — OCR bilingue FR+AR
@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaMedicalService) {}
}
