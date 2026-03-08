import {
  IsString, IsOptional, IsDateString, IsEmail, IsBoolean,
  IsEnum, IsArray, Matches, Length, IsNotEmpty,
} from 'class-validator';

export enum CiviliteEnum { M = 'M', MME = 'MME', MLLE = 'MLLE' }
export enum SexeEnum { M = 'M', F = 'F' }
export enum OrganismeAssuranceEnum {
  CNAS = 'CNAS', CASNOS = 'CASNOS',
  MUTUELLE_PRIVEE = 'MUTUELLE_PRIVEE', AUCUN = 'AUCUN',
}

export class CreatePatientDto {
  @IsEnum(CiviliteEnum)
  civilite: CiviliteEnum;

  @IsString()
  @IsNotEmpty()
  nomFr: string;

  @IsString()
  @IsNotEmpty()
  prenomFr: string;

  @IsOptional()
  @IsString()
  nomAr?: string;

  @IsOptional()
  @IsString()
  prenomAr?: string;

  @IsDateString()
  dateNaissance: string;

  @IsOptional()
  @IsString()
  lieuNaissance?: string;

  @IsOptional()
  @IsString()
  wilayaNaissance?: string;

  @IsEnum(SexeEnum)
  sexe: SexeEnum;

  // Adresse
  @IsOptional() @IsString() adresseLigne1?: string;
  @IsOptional() @IsString() commune?: string;
  @IsOptional() @IsString() daira?: string;

  @IsOptional()
  @Matches(/^(0[1-9]|[1-4][0-9]|5[0-8])$/, { message: 'Code wilaya invalide (01-58)' })
  wilaya?: string;

  @IsOptional()
  @Matches(/^\d{5}$/, { message: 'Code postal invalide (5 chiffres)' })
  codePostal?: string;

  // Contact
  @Matches(/^(\+213|0)(5|6|7)\d{8}$/, {
    message: 'Numéro de téléphone algérien invalide',
  })
  telephoneMobile: string;

  @IsOptional()
  @IsString()
  telephoneFixe?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // Sécurité sociale
  @IsOptional()
  @IsString()
  numeroSecuCnas?: string;

  @IsOptional()
  @IsString()
  numeroCasnos?: string;

  @IsEnum(OrganismeAssuranceEnum)
  @IsOptional()
  organismeAssurance?: OrganismeAssuranceEnum;

  @IsOptional()
  @Matches(/^\d{20}$/, { message: 'Numéro Carte Chifa invalide (20 chiffres)' })
  numeroCarteChifa?: string;

  // Données médicales
  @IsOptional() @IsString() groupeSanguin?: string;
  @IsOptional() @IsString() rhesus?: string;
  @IsOptional() @IsArray() allergiesConnues?: string[];

  // Contact urgence
  @IsOptional() @IsString() personneConfianceNom?: string;
  @IsOptional() @IsString() personneConfanceTel?: string;
  @IsOptional() @IsString() contactUrgenceNom?: string;
  @IsOptional() @IsString() contactUrgenceTel?: string;

  // Consentement Loi 18-07
  @IsBoolean()
  consentementDonnees: boolean;

  @IsOptional()
  @IsString()
  languePreferee?: 'FR' | 'AR' | 'BER' | 'EN';
}

export class UpdatePatientDto extends CreatePatientDto {}

export class SearchPatientDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() wilaya?: string;
  @IsOptional() @IsString() assurance?: string;
  @IsOptional() @IsString() statut?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
