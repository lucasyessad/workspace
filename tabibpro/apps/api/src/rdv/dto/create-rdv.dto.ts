import {
  IsUUID, IsDateString, IsString, IsOptional, IsNumber, Min, Max, IsEnum,
} from 'class-validator';

export class CreateRdvDto {
  @IsUUID()
  patientId: string;

  @IsDateString()
  dateHeure: string;

  @IsNumber()
  @Min(5)
  @Max(120)
  dureeMinutes: number;

  @IsString()
  motif: string;

  @IsEnum(['CONSULTATION', 'URGENCE', 'CONTROLE', 'SUIVI_CHRONIQUE', 'TELECONSULTATION'])
  @IsOptional()
  type?: string;

  @IsOptional() @IsString() notes?: string;
}

export class UpdateRdvDto {
  @IsOptional() @IsDateString() dateHeure?: string;
  @IsOptional() @IsNumber() @Min(5) @Max(120) dureeMinutes?: number;
  @IsOptional() @IsString() motif?: string;
  @IsOptional() @IsString() notes?: string;
}

export class AgendaQueryDto {
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsDateString() du?: string;
  @IsOptional() @IsDateString() au?: string;
}
