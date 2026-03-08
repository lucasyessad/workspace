// ============================================================
// TabibPro — Service Ordonnances
// Format algérien réglementaire : Standard, Bizone, Stupéfiants
// ============================================================

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';
import { CreateOrdonnanceDto } from './dto/create-ordonnance.dto';
import { addDays } from 'date-fns';

// Durée de validité réglementaire selon le type (jours)
const VALIDITE_PAR_TYPE: Record<string, number> = {
  STANDARD: 30,
  BIZONE: 30,
  CHRONIQUE: 90,
  STUPEFIANT: 7,   // ordonnances stupéfiants : 7 jours max en DZ
  MAGISTRALE: 30,
};

@Injectable()
export class OrdonnancesService {
  private readonly logger = new Logger(OrdonnancesService.name);

  constructor(private readonly prisma: PrismaMedicalService) {}

  async create(dto: CreateOrdonnanceDto, medecinId: string) {
    if (dto.lignes.length === 0) {
      throw new BadRequestException("L'ordonnance doit contenir au moins un médicament");
    }

    // Vérification spécifique stupéfiants
    if (dto.typeOrdonnance === 'STUPEFIANT' && dto.lignes.length > 1) {
      throw new BadRequestException(
        "Une ordonnance sécurisée (stupéfiants) ne peut contenir qu'un seul médicament en DZ"
      );
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
      select: { id: true, nomFr: true, prenomFr: true },
    });
    if (!patient) throw new NotFoundException('Patient introuvable');

    const medecin = await this.prisma.medecinProfil.findUnique({
      where: { id: medecinId },
    });
    if (!medecin) throw new NotFoundException('Médecin introuvable');

    const numeroOrdonnance = await this.genererNumeroOrdonnance();
    const type = (dto.typeOrdonnance || 'STANDARD') as string;
    const dureeValidite = VALIDITE_PAR_TYPE[type] || 30;
    const dateValidite = addDays(new Date(), dureeValidite);

    // Générer un QR code data pour vérification authenticité
    const qrCodeData = this.genererQrData(numeroOrdonnance, medecinId, dto.patientId);

    const ordonnance = await this.prisma.ordonnance.create({
      data: {
        numeroOrdonnance,
        patientId: dto.patientId,
        consultationId: dto.consultationId,
        medecinId,
        dateValidite,
        typeOrdonnance: type as any,
        instructionsGenerales: dto.instructionsGenerales,
        tiersPayantCnas: dto.tiersPayantCnas || false,
        estRenouvellement: dto.estRenouvellement || false,
        ordonnanceOriginaleId: dto.ordonnanceOriginaleId,
        nombreRenouvAutorise: dto.nombreRenouvAutorise,
        renouvellementRestants: dto.nombreRenouvAutorise,
        qrCodeData,
        statut: 'BROUILLON',
        lignes: {
          create: dto.lignes.map((ligne, index) => ({
            medicamentId: ligne.medicamentId,
            nomMedicament: ligne.nomMedicament,
            dci: ligne.dci,
            dosage: ligne.dosage,
            formeGalenique: ligne.formeGalenique,
            posologieMatin: ligne.posologieMatin,
            posologieMidi: ligne.posologieMidi,
            posologieSoir: ligne.posologieSoir,
            posologieCoucher: ligne.posologieCoucher,
            posologieTexteLibre: ligne.posologieTexteLibre,
            dureeTraitementJours: ligne.dureeTraitementJours,
            quantite: ligne.quantite || 1,
            instructionsSpecifiques: ligne.instructionsSpecifiques,
            estGenerique: ligne.estGenerique || false,
            substitutionAutorisee: ligne.substitutionAutorisee !== false,
            remboursableCnas: ligne.remboursableCnas || false,
            tauxRemboursementCnas: ligne.tauxRemboursementCnas,
            siBesoin: ligne.siBesoin || false,
            ordreAffichage: ligne.ordreAffichage || index,
          })),
        },
      },
      include: {
        lignes: true,
        patient: { select: { nomFr: true, prenomFr: true, nomAr: true, prenomAr: true, dateNaissance: true } },
        medecin: { select: { nomFr: true, prenomFr: true, specialite: true, numeroCnom: true, cachetNumerisePath: true } },
      },
    });

    this.logger.log(`Ordonnance créée : ${numeroOrdonnance} — Type: ${type}`);
    return ordonnance;
  }

  async valider(id: string, medecinId: string) {
    const ord = await this.prisma.ordonnance.findUnique({ where: { id } });
    if (!ord) throw new NotFoundException('Ordonnance introuvable');
    if (ord.medecinId !== medecinId) throw new BadRequestException("Cette ordonnance ne vous appartient pas");
    if (ord.statut !== 'BROUILLON') throw new BadRequestException("Seul un brouillon peut être validé");

    return this.prisma.ordonnance.update({
      where: { id },
      data: { statut: 'VALIDEE' },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.ordonnance.findMany({
      where: { patientId },
      orderBy: { dateCreation: 'desc' },
      include: {
        lignes: true,
        medecin: { select: { nomFr: true, prenomFr: true, specialite: true } },
      },
    });
  }

  async findOne(id: string) {
    const ord = await this.prisma.ordonnance.findUnique({
      where: { id },
      include: {
        lignes: { orderBy: { ordreAffichage: 'asc' } },
        patient: true,
        medecin: true,
      },
    });
    if (!ord) throw new NotFoundException('Ordonnance introuvable');
    return ord;
  }

  private async genererNumeroOrdonnance(): Promise<string> {
    const annee = new Date().getFullYear();
    const count = await this.prisma.ordonnance.count({
      where: { numeroOrdonnance: { startsWith: `ORD-${annee}-` } },
    });
    return `ORD-${annee}-${String(count + 1).padStart(6, '0')}`;
  }

  private genererQrData(numero: string, medecinId: string, patientId: string): string {
    const data = {
      n: numero,
      m: medecinId.substring(0, 8),
      p: patientId.substring(0, 8),
      t: Date.now(),
      v: 'TP1',
    };
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }
}
