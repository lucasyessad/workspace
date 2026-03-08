// ============================================================
// TabibPro — DTO Facturation
// Facturation en DZD — Tiers payant CNAS/CASNOS
// ============================================================

import {
  IsUUID, IsOptional, IsBoolean, IsNumber, IsArray,
  ValidateNested, IsString, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LigneFactureDto {
  @IsString()
  libelle: string;

  @IsOptional()
  @IsString()
  codeActe?: string;

  @IsNumber()
  @Min(0)
  montantDzd: number;

  @IsNumber()
  @Min(1)
  quantite: number;
}

export class CreateFactureDto {
  @IsUUID('4')
  patientId: string;

  @IsOptional()
  @IsUUID('4')
  consultationId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneFactureDto)
  lignes: LigneFactureDto[];

  @IsOptional()
  @IsBoolean()
  tiersPayantCnas?: boolean;

  @IsOptional()
  @IsBoolean()
  tiersPayantCasnos?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tauxRemboursementCnas?: number;
}

export class MarquerPayeeDto {
  @IsString()
  modeReglement: string;
}
