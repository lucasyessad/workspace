// ============================================================
// TabibPro — DTO Vaccination
// ============================================================

import { IsUUID, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateVaccinationDto {
  @IsUUID('4')
  patientId: string;

  @IsString()
  vaccin: string;

  @IsDateString()
  dateVaccination: string;

  @IsOptional()
  @IsString()
  lot?: string;

  @IsOptional()
  @IsString()
  site?: string;

  @IsOptional()
  @IsString()
  operateur?: string;

  @IsOptional()
  @IsString()
  reactionObservee?: string;
}
