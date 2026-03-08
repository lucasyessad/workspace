// ============================================================
// TabibPro — Service Facturation
// Facturation DZD — Tiers payant CNAS/CASNOS — Algérie
// ============================================================

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';
import { CreateFactureDto } from './dto/create-facture.dto';

@Injectable()
export class FacturationService {
  private readonly logger = new Logger(FacturationService.name);

  constructor(private readonly prisma: PrismaMedicalService) {}

  // ---- Créer une facture ----

  async createFacture(dto: CreateFactureDto, medecinId: string) {
    // Vérifier que le patient existe
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
      select: { id: true, nomFr: true, prenomFr: true },
    });
    if (!patient) throw new NotFoundException(`Patient introuvable`);

    // Calcul du montant total DZD
    const montantTotal = dto.lignes.reduce(
      (acc, ligne) => acc + ligne.montantDzd * ligne.quantite,
      0
    );

    const taux = dto.tauxRemboursementCnas ?? 0;
    const montantRembourse = Math.round((montantTotal * taux) / 100 * 100) / 100;
    const montantPatient = Math.round((montantTotal - montantRembourse) * 100) / 100;

    const numeroFacture = await this.genererNumeroFacture();

    const facture = await this.prisma.facture.create({
      data: {
        numeroFacture,
        patientId: dto.patientId,
        medecinId,
        consultationId: dto.consultationId ?? null,
        lignes: {
          create: dto.lignes.map((l) => ({
            libelle: l.libelle,
            codeActe: l.codeActe ?? null,
            montantDzd: l.montantDzd,
            quantite: l.quantite,
            totalDzd: l.montantDzd * l.quantite,
          })),
        },
        montantTotalDzd: montantTotal,
        montantRembourseeDzd: montantRembourse,
        montantPatientDzd: montantPatient,
        tiersPayantCnas: dto.tiersPayantCnas ?? false,
        tiersPayantCasnos: dto.tiersPayantCasnos ?? false,
        tauxRemboursementCnas: taux,
        statut: 'EN_ATTENTE',
      },
      include: {
        lignes: true,
        patient: {
          select: { id: true, nomFr: true, prenomFr: true, numeroPatient: true },
        },
      },
    });

    this.logger.log(
      `Facture créée : ${numeroFacture} — ${montantTotal} DZD — Patient ${patient.nomFr} ${patient.prenomFr}`
    );
    return facture;
  }

  // ---- Historique factures d'un patient ----

  async findByPatient(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });
    if (!patient) throw new NotFoundException(`Patient introuvable`);

    return this.prisma.facture.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        lignes: true,
      },
    });
  }

  // ---- Statistiques de facturation ----

  async getStats(medecinId: string, mois?: string) {
    const where: any = { medecinId };

    if (mois) {
      // mois au format YYYY-MM
      const [annee, moisNum] = mois.split('-').map(Number);
      const debut = new Date(annee, moisNum - 1, 1);
      const fin = new Date(annee, moisNum, 1);
      where.createdAt = { gte: debut, lt: fin };
    }

    const factures = await this.prisma.facture.findMany({
      where,
      select: {
        montantTotalDzd: true,
        montantPatientDzd: true,
        montantRembourseeDzd: true,
        statut: true,
        modeReglement: true,
      },
    });

    const nbFactures = factures.length;
    const totalDzd = factures.reduce((acc, f) => acc + f.montantTotalDzd, 0);
    const paideDzd = factures
      .filter((f) => f.statut === 'PAYEE')
      .reduce((acc, f) => acc + f.montantPatientDzd, 0);
    const impayeeDzd = factures
      .filter((f) => f.statut === 'EN_ATTENTE')
      .reduce((acc, f) => acc + f.montantPatientDzd, 0);
    const tauxRecouvrement = totalDzd > 0 ? Math.round((paideDzd / totalDzd) * 100) : 0;

    // Répartition par mode de règlement
    const parModeReglement: Record<string, number> = {
      ESPECES: 0,
      VIREMENT: 0,
      CHEQUE: 0,
      CNAS: 0,
      CASNOS: 0,
    };

    for (const f of factures) {
      if (f.statut === 'PAYEE' && f.modeReglement) {
        const mode = f.modeReglement as string;
        if (mode in parModeReglement) {
          parModeReglement[mode] += f.montantPatientDzd;
        }
      }
    }

    return {
      totalDzd: Math.round(totalDzd * 100) / 100,
      paideDzd: Math.round(paideDzd * 100) / 100,
      impayeeDzd: Math.round(impayeeDzd * 100) / 100,
      nbFactures,
      tauxRecouvrement,
      parModeReglement,
    };
  }

  // ---- Marquer une facture comme payée ----

  async marquerPayee(id: string, modeReglement: string, medecinId: string) {
    const facture = await this.prisma.facture.findUnique({
      where: { id },
    });

    if (!facture) throw new NotFoundException(`Facture introuvable`);
    if (facture.medecinId !== medecinId) {
      throw new NotFoundException(`Facture introuvable`);
    }

    const facturePayee = await this.prisma.facture.update({
      where: { id },
      data: {
        statut: 'PAYEE',
        modeReglement: modeReglement as any,
        dateReglement: new Date(),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Facture ${facture.numeroFacture} marquée payée (${modeReglement})`);
    return facturePayee;
  }

  // ---- Numérotation automatique FACT-YYYY-NNNNNN ----

  private async genererNumeroFacture(): Promise<string> {
    const annee = new Date().getFullYear();
    const count = await this.prisma.facture.count({
      where: {
        numeroFacture: { startsWith: `FACT-${annee}-` },
      },
    });
    const numero = String(count + 1).padStart(6, '0');
    return `FACT-${annee}-${numero}`;
  }
}
