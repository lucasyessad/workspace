import {
  IsString, IsOptional, IsDateString, IsNumber, IsArray,
  IsEnum, IsNotEmpty, IsUUID, Min, Max, IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConsultationDto {
  @IsUUID()
  patientId: string;

  @IsDateString()
  dateHeure: string;

  @IsString()
  @IsNotEmpty()
  motifConsultation: string;

  @IsEnum(['CONSULTATION', 'URGENCE', 'CONTROLE', 'SUIVI_CHRONIQUE', 'TELECONSULTATION', 'VISITE_DOMICILE'])
  @IsOptional()
  type?: string;

  // Constantes vitales
  @IsOptional() @IsNumber() @Min(50) @Max(300) tensionSystolique?: number;
  @IsOptional() @IsNumber() @Min(20) @Max(200) tensionDiastolique?: number;
  @IsOptional() @IsNumber() @Min(20) @Max(300) pouls?: number;
  @IsOptional() @Type(() => Number) temperature?: number;
  @IsOptional() @Type(() => Number) poids?: number;
  @IsOptional() @Type(() => Number) taille?: number;
  @IsOptional() @Type(() => Number) saturationO2?: number;
  @IsOptional() @Type(() => Number) glycemieCapillaire?: number;
  @IsOptional() @Type(() => Number) perimetreAbdominal?: number;

  // Données cliniques
  @IsOptional() @IsString() examenClinique?: string;
  @IsOptional() @IsString() diagnosticPrincipal?: string;
  @IsOptional() @IsArray() diagnosticsSecondaires?: string[];
  @IsOptional() @IsString() codeCim10Principal?: string;
  @IsOptional() @IsArray() codesCim10Secondaires?: string[];
  @IsOptional() @IsString() notesConfidentielles?: string;
  @IsOptional() @IsString() conclusion?: string;
  @IsOptional() @IsString() conduiteATenir?: string;
  @IsOptional() @IsArray() actesRealises?: Array<{ code: string; libelle: string; tarifCnas?: number }>;

  @IsOptional() @IsDateString() consultationSuivantePrevue?: string;
  @IsOptional() @IsNumber() @Min(5) @Max(480) dureeMinutes?: number;
}

export class UpdateConsultationDto extends CreateConsultationDto {}

export class TerminerConsultationDto {
  @IsOptional() @IsString() conclusion?: string;
  @IsOptional() @IsString() conduiteATenir?: string;
  @IsOptional() @IsDateString() consultationSuivantePrevue?: string;
}
