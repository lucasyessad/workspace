// ============================================================
// TabibPro — Service d'Authentification
// Médecin (email + CNOM) et Patient (téléphone)
// ============================================================

import {
  Injectable, UnauthorizedException, Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaMedicalService } from '../database/prisma-medical.service';
import { PrismaServiceService } from '../database/prisma-service.service';
import { LoginMedecinDto, LoginPatientDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prismaMedical: PrismaMedicalService,
    private readonly prismaService: PrismaServiceService,
  ) {}

  // ---- Connexion Médecin ----

  async loginMedecin(dto: LoginMedecinDto) {
    // TODO: implémenter avec la table users de db-service
    // Pour l'instant, validation basique pour le développement
    const user = await this.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const medecinProfil = await this.prismaMedical.medecinProfil.findUnique({
      where: { userId: user.id },
    });

    if (!medecinProfil) {
      throw new UnauthorizedException("Profil médecin non trouvé. Contactez l'administrateur.");
    }

    return this.generateTokens({
      sub: user.id,
      email: user.email,
      role: 'MEDECIN',
      medecinId: medecinProfil.id,
    });
  }

  // ---- Connexion Patient ----

  async loginPatient(dto: LoginPatientDto) {
    const patient = await this.prismaMedical.patient.findFirst({
      where: { telephoneMobile: dto.telephone },
    });

    if (!patient) {
      throw new UnauthorizedException('Numéro de téléphone ou mot de passe incorrect');
    }

    // TODO: vérifier hash mot de passe en DB service
    return this.generateTokens({
      sub: patient.id,
      email: patient.email || '',
      role: 'PATIENT',
      patientId: patient.id,
    });
  }

  // ---- Génération des tokens ----

  private generateTokens(payload: {
    sub: string;
    email: string;
    role: string;
    medecinId?: string;
    patientId?: string;
  }) {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
      secret: this.config.get('JWT_REFRESH_SECRET', this.config.get('JWT_SECRET')),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.get('JWT_EXPIRES_IN', '8h'),
      role: payload.role,
    };
  }

  // ---- Hash mot de passe ----

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // ---- Stub DB service ----

  private async findUserByEmail(email: string) {
    // TODO: implémenter avec db-service prisma
    // Stub pour développement
    return null as any;
  }
}
