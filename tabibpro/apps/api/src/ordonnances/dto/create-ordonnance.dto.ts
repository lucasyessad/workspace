import {
  IsString, IsOptional, IsUUID, IsEnum, IsBoolean,
  IsArray, IsNumber, ValidateNested, IsNotEmpty, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LigneOrdonnanceDto {
  @IsOptional() @IsUUID() medicamentId?: string;

  @IsString()
  @IsNotEmpty()
  nomMedicament: string;

  @IsOptional() @IsString() dci?: string;
  @IsOptional() @IsString() dosage?: string;
  @IsOptional() @IsString() formeGalenique?: string;

  // Posologie
  @IsOptional() @IsNumber() @Min(0) posologieMatin?: number;
  @IsOptional() @IsNumber() @Min(0) posologieMidi?: number;
  @IsOptional() @IsNumber() @Min(0) posologieSoir?: number;
  @IsOptional() @IsNumber() @Min(0) posologieCoucher?: number;
  @IsOptional() @IsString() posologieTexteLibre?: string;

  @IsOptional() @IsNumber() @Min(1) @Max(365) dureeTraitementJours?: number;
  @IsOptional() @IsNumber() @Min(1) quantite?: number;
  @IsOptional() @IsString() instructionsSpecifiques?: string;

  @IsOptional() @IsBoolean() estGenerique?: boolean;
  @IsOptional() @IsBoolean() substitutionAutorisee?: boolean;
  @IsOptional() @IsBoolean() remboursableCnas?: boolean;
  @IsOptional() @IsNumber() @Min(0) @Max(100) tauxRemboursementCnas?: number;
  @IsOptional() @IsBoolean() siBesoin?: boolean;
  @IsOptional() @IsNumber() ordreAffichage?: number;
}

export class CreateOrdonnanceDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  consultationId?: string;

  @IsEnum(['STANDARD', 'BIZONE', 'CHRONIQUE', 'STUPEFIANT', 'MAGISTRALE'])
  @IsOptional()
  typeOrdonnance?: string;

  @IsOptional() @IsString() instructionsGenerales?: string;
  @IsOptional() @IsBoolean() tiersPayantCnas?: boolean;
  @IsOptional() @IsBoolean() estRenouvellement?: boolean;
  @IsOptional() @IsUUID() ordonnanceOriginaleId?: string;
  @IsOptional() @IsNumber() @Min(1) nombreRenouvAutorise?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneOrdonnanceDto)
  lignes: LigneOrdonnanceDto[];
}
