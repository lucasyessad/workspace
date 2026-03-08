// ============================================================
// TabibPro — DTO Mouvement de Stock
// ============================================================

import {
  IsUUID, IsEnum, IsNumber, IsOptional, IsString,
  IsDateString, Min,
} from 'class-validator';

export enum TypeMouvement {
  ENTREE = 'ENTREE',
  SORTIE = 'SORTIE',
  AJUSTEMENT = 'AJUSTEMENT',
  PEREMPTION = 'PEREMPTION',
}

export class CreateMouvementStockDto {
  @IsUUID('4')
  medicamentId: string;

  @IsEnum(TypeMouvement)
  type: TypeMouvement;

  @IsNumber()
  @Min(1)
  quantite: number;

  @IsOptional()
  @IsDateString()
  datePeremption?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prixAchatDzd?: number;

  @IsOptional()
  @IsString()
  fournisseur?: string;

  @IsOptional()
  @IsString()
  motif?: string;
}
