// ============================================================
// TabibPro — Service Patients
// CRUD + recherche full-text + numérotation automatique
// ============================================================

import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';
import { CreatePatientDto, SearchPatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(private readonly prisma: PrismaMedicalService) {}

  // ---- Création patient ----

  async create(dto: CreatePatientDto, medecinId: string) {
    // Vérification doublon téléphone
    const existant = await this.prisma.patient.findFirst({
      where: { telephoneMobile: dto.telephoneMobile },
    });
    if (existant) {
      throw new ConflictException(
        `Un patient avec le numéro ${dto.telephoneMobile} existe déjà (${existant.numeroPatient})`
      );
    }

    const numeroPatient = await this.genererNumeroPatient();

    const patient = await this.prisma.patient.create({
      data: {
        numeroPatient,
        civilite: dto.civilite as any,
        nomFr: dto.nomFr,
        prenomFr: dto.prenomFr,
        nomAr: dto.nomAr,
        prenomAr: dto.prenomAr,
        dateNaissance: new Date(dto.dateNaissance),
        lieuNaissance: dto.lieuNaissance,
        wilayaNaissance: dto.wilayaNaissance,
        sexe: dto.sexe as any,
        adresseLigne1: dto.adresseLigne1,
        commune: dto.commune,
        daira: dto.daira,
        wilaya: dto.wilaya,
        codePostal: dto.codePostal,
        telephoneMobile: dto.telephoneMobile,
        telephoneFixe: dto.telephoneFixe,
        email: dto.email,
        numeroSecuCnas: dto.numeroSecuCnas,
        numeroCasnos: dto.numeroCasnos,
        organismeAssurance: (dto.organismeAssurance as any) || 'AUCUN',
        numeroCarteChifa: dto.numeroCarteChifa,
        groupeSanguin: dto.groupeSanguin as any,
        rhesus: dto.rhesus as any,
        allergiesConnues: dto.allergiesConnues || [],
        personneConfianceNom: dto.personneConfianceNom,
        personneConfanceTel: dto.personneConfanceTel,
        contactUrgenceNom: dto.contactUrgenceNom,
        contactUrgenceTel: dto.contactUrgenceTel,
        consentementDonnees: dto.consentementDonnees,
        dateConsentement: dto.consentementDonnees ? new Date() : null,
        languePreferee: (dto.languePreferee as any) || 'FR',
        medecinTraitantId: medecinId,
        creePar: medecinId,
      },
    });

    this.logger.log(`Patient créé : ${patient.numeroPatient} — ${patient.nomFr} ${patient.prenomFr}`);
    return patient;
  }

  // ---- Recherche patients ----

  async search(dto: SearchPatientDto, medecinId: string) {
    const page = Math.max(1, dto.page || 1);
    const limit = Math.min(50, dto.limit || 20);
    const skip = (page - 1) * limit;

    const where: any = {
      medecinTraitantId: medecinId,
      statut: dto.statut || 'ACTIF',
    };

    if (dto.wilaya) where.wilaya = dto.wilaya;
    if (dto.assurance) where.organismeAssurance = dto.assurance;

    if (dto.q) {
      const q = dto.q.trim();
      where.OR = [
        { nomFr: { contains: q, mode: 'insensitive' } },
        { prenomFr: { contains: q, mode: 'insensitive' } },
        { nomAr: { contains: q, mode: 'insensitive' } },
        { telephoneMobile: { contains: q } },
        { numeroCarteChifa: { contains: q } },
        { numeroPatient: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [patients, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          numeroPatient: true,
          civilite: true,
          nomFr: true,
          prenomFr: true,
          nomAr: true,
          prenomAr: true,
          dateNaissance: true,
          sexe: true,
          telephoneMobile: true,
          wilaya: true,
          organismeAssurance: true,
          numeroCarteChifa: true,
          groupeSanguin: true,
          allergiesConnues: true,
          statut: true,
          languePreferee: true,
          createdAt: true,
          _count: { select: { consultations: true } },
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ---- Récupération patient ----

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        consultations: {
          orderBy: { dateHeure: 'desc' },
          take: 10,
          select: {
            id: true,
            numeroConsultation: true,
            dateHeure: true,
            motifConsultation: true,
            diagnosticPrincipal: true,
            statut: true,
          },
        },
        ordonnances: {
          orderBy: { dateCreation: 'desc' },
          take: 5,
          select: {
            id: true,
            numeroOrdonnance: true,
            dateCreation: true,
            typeOrdonnance: true,
            statut: true,
          },
        },
        vaccinations: {
          orderBy: { dateVaccination: 'desc' },
        },
        protocolesSuivi: {
          where: { statut: 'ACTIF' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient introuvable`);
    }

    return patient;
  }

  // ---- Mise à jour ----

  async update(id: string, dto: Partial<CreatePatientDto>, medecinId: string) {
    await this.findOne(id);

    return this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        modifiePar: medecinId,
        updatedAt: new Date(),
      } as any,
    });
  }

  // ---- Archivage (jamais suppression — Loi 18-07) ----

  async archive(id: string, medecinId: string) {
    await this.findOne(id);
    return this.prisma.patient.update({
      where: { id },
      data: { statut: 'ARCHIVE', modifiePar: medecinId },
    });
  }

  // ---- Numérotation automatique ----

  private async genererNumeroPatient(): Promise<string> {
    const annee = new Date().getFullYear();
    const count = await this.prisma.patient.count({
      where: {
        numeroPatient: { startsWith: `PAT-${annee}-` },
      },
    });
    const numero = String(count + 1).padStart(5, '0');
    return `PAT-${annee}-${numero}`;
  }
}
