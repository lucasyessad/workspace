import { Injectable } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';

// TODO: Notifications SMS/push Algérie
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaMedicalService) {}
}
