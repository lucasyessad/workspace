// ============================================================
// TabibPro — Service Consultations
// ============================================================

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';
import { CreateConsultationDto, TerminerConsultationDto } from './dto/create-consultation.dto';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class ConsultationsService {
  private readonly logger = new Logger(ConsultationsService.name);

  constructor(private readonly prisma: PrismaMedicalService) {}

  async create(dto: CreateConsultationDto, medecinId: string) {
    // Vérifier que le patient existe
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient introuvable');

    const numeroConsultation = await this.genererNumeroConsultation();

    // Calculer l'IMC si poids + taille fournis
    let imc: number | undefined;
    if (dto.poids && dto.taille) {
      const tailleM = dto.taille / 100;
      imc = Math.round((dto.poids / (tailleM * tailleM)) * 10) / 10;
    }

    // Chiffrer les notes confidentielles
    const notesChiffrees = dto.notesConfidentielles
      ? this.chiffrerNotes(dto.notesConfidentielles)
      : undefined;

    const consultation = await this.prisma.consultation.create({
      data: {
        numeroConsultation,
        patientId: dto.patientId,
        medecinId,
        dateHeure: new Date(dto.dateHeure),
        motifConsultation: dto.motifConsultation,
        type: (dto.type as any) || 'CONSULTATION',
        tensionSystolique: dto.tensionSystolique,
        tensionDiastolique: dto.tensionDiastolique,
        pouls: dto.pouls,
        temperature: dto.temperature,
        poids: dto.poids,
        taille: dto.taille,
        imc,
        saturationO2: dto.saturationO2,
        glycemieCapillaire: dto.glycemieCapillaire,
        perimetreAbdominal: dto.perimetreAbdominal,
        examenClinique: dto.examenClinique,
        diagnosticPrincipal: dto.diagnosticPrincipal,
        diagnosticsSecondaires: dto.diagnosticsSecondaires || [],
        codeCim10Principal: dto.codeCim10Principal,
        codesCim10Secondaires: dto.codesCim10Secondaires || [],
        notesConfidentielles: notesChiffrees,
        conclusion: dto.conclusion,
        conduiteATenir: dto.conduiteATenir,
        actesRealises: dto.actesRealises || [],
        consultationSuivantePrevue: dto.consultationSuivantePrevue
          ? new Date(dto.consultationSuivantePrevue)
          : undefined,
        dureeMinutes: dto.dureeMinutes,
        statut: 'EN_COURS',
      },
      include: {
        patient: {
          select: { id: true, nomFr: true, prenomFr: true, numeroPatient: true },
        },
      },
    });

    this.logger.log(`Consultation créée : ${numeroConsultation}`);
    return consultation;
  }

  async findByPatient(patientId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [consultations, total] = await this.prisma.$transaction([
      this.prisma.consultation.findMany({
        where: { patientId },
        skip,
        take: limit,
        orderBy: { dateHeure: 'desc' },
        include: {
          medecin: { select: { nomFr: true, prenomFr: true, specialite: true } },
          _count: { select: { ordonnances: true, documents: true } },
        },
      }),
      this.prisma.consultation.count({ where: { patientId } }),
    ]);

    return { data: consultations, total, page, limit };
  }

  async findOne(id: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      include: {
        patient: true,
        medecin: true,
        ordonnances: {
          include: { lignes: true },
        },
        documents: true,
        suggestionsIA: {
          select: {
            id: true, typeRequete: true, decisionMedecin: true, createdAt: true,
          },
        },
      },
    });

    if (!consultation) throw new NotFoundException('Consultation introuvable');

    // Déchiffrer les notes confidentielles si présentes
    if (consultation.notesConfidentielles) {
      consultation.notesConfidentielles = this.dechiffrerNotes(
        consultation.notesConfidentielles
      );
    }

    return consultation;
  }

  async terminer(id: string, dto: TerminerConsultationDto, medecinId: string) {
    const consultation = await this.prisma.consultation.findUnique({ where: { id } });
    if (!consultation) throw new NotFoundException('Consultation introuvable');
    if (consultation.medecinId !== medecinId) {
      throw new BadRequestException('Cette consultation ne vous appartient pas');
    }

    const fin = new Date();
    const debut = consultation.createdAt;
    const dureeMinutes = Math.round((fin.getTime() - debut.getTime()) / 60000);

    return this.prisma.consultation.update({
      where: { id },
      data: {
        statut: 'TERMINEE',
        conclusion: dto.conclusion,
        conduiteATenir: dto.conduiteATenir,
        consultationSuivantePrevue: dto.consultationSuivantePrevue
          ? new Date(dto.consultationSuivantePrevue)
          : undefined,
        dureeMinutes,
        updatedAt: fin,
      },
    });
  }

  private async genererNumeroConsultation(): Promise<string> {
    const now = new Date();
    const moisAnnee = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.prisma.consultation.count({
      where: {
        numeroConsultation: { startsWith: `CONS-${moisAnnee}-` },
      },
    });
    return `CONS-${moisAnnee}-${String(count + 1).padStart(5, '0')}`;
  }

  // Chiffrement AES-256 pour les notes confidentielles (Loi 18-07)
  private chiffrerNotes(notes: string): string {
    const key = process.env.NOTES_ENCRYPTION_KEY || 'tabibpro-notes-key-dev-32chars!!';
    return CryptoJS.AES.encrypt(notes, key).toString();
  }

  private dechiffrerNotes(notesChiffrees: string): string {
    try {
      const key = process.env.NOTES_ENCRYPTION_KEY || 'tabibpro-notes-key-dev-32chars!!';
      const bytes = CryptoJS.AES.decrypt(notesChiffrees, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return '[Notes — erreur de déchiffrement]';
    }
  }
}
