import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches, MinLength } from 'class-validator';

export class LoginMedecinDto {
  @IsEmail({}, { message: 'Email professionnel invalide' })
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginPatientDto {
  @IsString()
  @Matches(/^(\+213|0)(5|6|7)\d{8}$/, {
    message: 'Numéro de téléphone algérien invalide (ex: 0555 12 34 56)',
  })
  telephone: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
