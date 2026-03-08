// ============================================================
// TabibPro — Service RDV
// ============================================================

import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';
import { CreateRdvDto, UpdateRdvDto, AgendaQueryDto } from './dto/create-rdv.dto';
import { startOfDay, endOfDay, addMinutes, getDay } from 'date-fns';
import { FilAttenteGateway } from './fil-attente.gateway';

// Weekend algérien : Vendredi (5) + Samedi (6) — informatif seulement
function isWeekendDZ(date: Date): boolean {
  const dow = getDay(date);
  return dow === 5 || dow === 6;
}

@Injectable()
export class RdvService {
  private readonly logger = new Logger(RdvService.name);
  // Stockage en mémoire pour la file d'attente (Redis en prod)
  private readonly fileAttente: Map<string, { patientId: string; nom: string; heureArrivee: Date; priorite: 'NORMAL' | 'URGENT' }[]> = new Map();

  constructor(
    private readonly prisma: PrismaMedicalService,
    private readonly filAttenteGateway: FilAttenteGateway,
  ) {}

  // ---- Créer un RDV ----

  async create(dto: CreateRdvDto, medecinId: string) {
    const dateHeure = new Date(dto.dateHeure);

    // Vérifier chevauchement
    const fin = addMinutes(dateHeure, dto.dureeMinutes);
    const chevauchement = await this.prisma.consultation.findFirst({
      where: {
        medecinId,
        statut: { not: 'ANNULEE' },
        dateHeure: {
          gte: startOfDay(dateHeure),
          lt: endOfDay(dateHeure),
        },
      },
    });

    // TODO: vérification chevauchement plus précise

    const consultation = await this.prisma.consultation.create({
      data: {
        numeroConsultation: await this.genererNumeroConsultation(),
        patientId: dto.patientId,
        medecinId,
        dateHeure,
        motifConsultation: dto.motif,
        type: (dto.type as any) || 'CONSULTATION',
        dureeMinutes: dto.dureeMinutes,
        statut: 'EN_COURS',
        actesRealises: [],
        diagnosticsSecondaires: [],
        codesCim10Secondaires: [],
      },
      include: {
        patient: { select: { nomFr: true, prenomFr: true, telephoneMobile: true } },
      },
    });

    this.logger.log(`RDV créé pour le ${dateHeure.toISOString()} — ${dto.motif}`);
    return consultation;
  }

  // ---- Agenda d'une journée ----

  async getAgenda(medecinId: string, query: AgendaQueryDto) {
    const date = query.date ? new Date(query.date) : new Date();

    const consultations = await this.prisma.consultation.findMany({
      where: {
        medecinId,
        dateHeure: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
      orderBy: { dateHeure: 'asc' },
      include: {
        patient: {
          select: {
            id: true, nomFr: true, prenomFr: true,
            telephoneMobile: true, organismeAssurance: true, numeroCarteChifa: true,
          },
        },
      },
    });

    return {
      date: date.toISOString().split('T')[0],
      isWeekend: isWeekendDZ(date),
      consultations,
      stats: {
        total: consultations.length,
        terminees: consultations.filter((c) => c.statut === 'TERMINEE').length,
        enAttente: consultations.filter((c) => c.statut === 'EN_COURS').length,
      },
    };
  }

  // ---- File d'attente (WebSocket) ----

  async arriverPatient(patientId: string, medecinId: string, priorite: 'NORMAL' | 'URGENT' = 'NORMAL') {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { nomFr: true, prenomFr: true },
    });
    if (!patient) throw new NotFoundException('Patient introuvable');

    if (!this.fileAttente.has(medecinId)) {
      this.fileAttente.set(medecinId, []);
    }

    const file = this.fileAttente.get(medecinId)!;
    file.push({
      patientId,
      nom: `${patient.prenomFr} ${patient.nomFr}`,
      heureArrivee: new Date(),
      priorite,
    });

    // Trier : urgents en premier
    file.sort((a, b) =>
      a.priorite === 'URGENT' && b.priorite !== 'URGENT' ? -1
      : b.priorite === 'URGENT' && a.priorite !== 'URGENT' ? 1
      : a.heureArrivee.getTime() - b.heureArrivee.getTime()
    );

    // Broadcaster via WebSocket
    this.filAttenteGateway.diffuserFileAttente(medecinId, file);

    return { position: file.findIndex((p) => p.patientId === patientId) + 1, file };
  }

  async appellerSuivant(medecinId: string) {
    const file = this.fileAttente.get(medecinId) || [];
    if (file.length === 0) return { message: 'File d\'attente vide', patient: null };

    const prochain = file.shift()!;
    this.fileAttente.set(medecinId, file);
    this.filAttenteGateway.diffuserFileAttente(medecinId, file);

    return { patient: prochain, restants: file.length };
  }

  getFileAttente(medecinId: string) {
    return this.fileAttente.get(medecinId) || [];
  }

  private async genererNumeroConsultation(): Promise<string> {
    const now = new Date();
    const moisAnnee = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.prisma.consultation.count({
      where: { numeroConsultation: { startsWith: `CONS-${moisAnnee}-` } },
    });
    return `CONS-${moisAnnee}-${String(count + 1).padStart(5, '0')}`;
  }
}
