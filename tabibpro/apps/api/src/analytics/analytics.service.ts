// ============================================================
// TabibPro — Service Analytics
// Statistiques cabinet médical algérien
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';

type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

function getPlageDate(periode: Periode): { debut: Date; fin: Date } {
  const now = new Date();
  const fin = new Date(now);
  fin.setHours(23, 59, 59, 999);
  const debut = new Date(now);

  switch (periode) {
    case 'jour':
      debut.setHours(0, 0, 0, 0);
      break;
    case 'semaine':
      const jourSemaine = debut.getDay();
      const diffLundi = jourSemaine === 0 ? -6 : 1 - jourSemaine;
      debut.setDate(debut.getDate() + diffLundi);
      debut.setHours(0, 0, 0, 0);
      break;
    case 'mois':
      debut.setDate(1);
      debut.setHours(0, 0, 0, 0);
      break;
    case 'annee':
      debut.setMonth(0, 1);
      debut.setHours(0, 0, 0, 0);
      break;
  }

  return { debut, fin };
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaMedicalService) {}

  // ---- Dashboard stats ----

  async getDashboardStats(medecinId: string, periode: Periode) {
    const { debut, fin } = getPlageDate(periode);
    const plage = { gte: debut, lte: fin };

    // Consultations
    const [totalConsultations, terminees, annulees, urgences] = await Promise.all([
      this.prisma.consultation.count({
        where: { medecinId, dateHeure: plage },
      }),
      this.prisma.consultation.count({
        where: { medecinId, dateHeure: plage, statut: 'TERMINEE' },
      }),
      this.prisma.consultation.count({
        where: { medecinId, dateHeure: plage, statut: 'ANNULEE' },
      }),
      this.prisma.consultation.count({
        where: { medecinId, dateHeure: plage, type: 'URGENCE' },
      }),
    ]);

    // Patients
    const [totalPatients, nouveauxPatients] = await Promise.all([
      this.prisma.patient.count({
        where: { medecinTraitantId: medecinId, statut: 'ACTIF' },
      }),
      this.prisma.patient.count({
        where: { medecinTraitantId: medecinId, createdAt: plage },
      }),
    ]);

    // Patients actifs dans la période (avec au moins une consultation)
    const patientsActifsResult = await this.prisma.consultation.findMany({
      where: { medecinId, dateHeure: plage },
      select: { patientId: true },
      distinct: ['patientId'],
    });
    const patientsActifs = patientsActifsResult.length;

    // Ordonnances
    const [totalOrdonnances, validees] = await Promise.all([
      this.prisma.ordonnance.count({
        where: { medecinId, dateCreation: plage },
      }),
      this.prisma.ordonnance.count({
        where: { medecinId, dateCreation: plage, statut: 'VALIDEE' },
      }),
    ]);

    // Revenus DZD
    const factures = await this.prisma.facture.findMany({
      where: { medecinId, createdAt: plage },
      select: {
        montantTotalDzd: true,
        montantRembourseeDzd: true,
        montantPatientDzd: true,
        statut: true,
      },
    });

    const totalDzd = factures.reduce((acc, f) => acc + f.montantTotalDzd, 0);
    const remboursesCnasDzd = factures.reduce((acc, f) => acc + f.montantRembourseeDzd, 0);
    const encaissesDzd = factures
      .filter((f) => f.statut === 'PAYEE')
      .reduce((acc, f) => acc + f.montantPatientDzd, 0);

    // Taux d'occupation (rdv pris / créneaux disponibles — approx)
    const totalRdv = await this.prisma.rendezvous.count({
      where: { medecinId, dateHeure: plage },
    });
    const rdvHonores = await this.prisma.rendezvous.count({
      where: { medecinId, dateHeure: plage, statut: 'HONORE' },
    });
    const tauxOccupation = totalRdv > 0 ? Math.round((rdvHonores / totalRdv) * 100) : 0;

    // Durée moyenne de consultation
    const consultsAvecDuree = await this.prisma.consultation.findMany({
      where: {
        medecinId,
        dateHeure: plage,
        statut: 'TERMINEE',
        dureeMinutes: { not: null },
      },
      select: { dureeMinutes: true },
    });

    const dureeConsultationMoyenne =
      consultsAvecDuree.length > 0
        ? Math.round(
            consultsAvecDuree.reduce((acc, c) => acc + (c.dureeMinutes ?? 0), 0) /
              consultsAvecDuree.length
          )
        : 0;

    this.logger.log(
      `Dashboard stats [${periode}] pour médecin ${medecinId} — ${totalConsultations} consultations`
    );

    return {
      consultations: { total: totalConsultations, terminees, annulees, urgences },
      patients: { total: totalPatients, nouveaux: nouveauxPatients, actifs: patientsActifs },
      ordonnances: { total: totalOrdonnances, validees },
      revenus: {
        totalDzd: Math.round(totalDzd * 100) / 100,
        remboursesCnasDzd: Math.round(remboursesCnasDzd * 100) / 100,
        encaissesDzd: Math.round(encaissesDzd * 100) / 100,
      },
      tauxOccupation,
      dureeConsultationMoyenne,
    };
  }

  // ---- Top diagnostics CIM-10 du mois ----

  async getTopDiagnostics(medecinId: string, limit: number) {
    const debut = new Date();
    debut.setDate(1);
    debut.setHours(0, 0, 0, 0);

    const consultations = await this.prisma.consultation.findMany({
      where: {
        medecinId,
        dateHeure: { gte: debut },
        codeCim10Principal: { not: null },
        statut: 'TERMINEE',
      },
      select: {
        codeCim10Principal: true,
        diagnosticPrincipal: true,
      },
    });

    // Agréger par code CIM-10
    const compteurs: Record<string, { code: string; diagnostic: string; count: number }> = {};
    for (const c of consultations) {
      if (!c.codeCim10Principal) continue;
      const key = c.codeCim10Principal;
      if (!compteurs[key]) {
        compteurs[key] = {
          code: c.codeCim10Principal,
          diagnostic: c.diagnosticPrincipal ?? key,
          count: 0,
        };
      }
      compteurs[key].count++;
    }

    const topDiagnostics = Object.values(compteurs)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    this.logger.log(`Top ${limit} diagnostics pour médecin ${medecinId}`);
    return topDiagnostics;
  }

  // ---- Évolution mensuelle sur une année ----

  async getEvolutionMensuelle(medecinId: string, annee: number) {
    const evolution: Array<{
      mois: number;
      libelleMois: string;
      consultations: number;
      nouveauxPatients: number;
      revenusDzd: number;
    }> = [];

    const moisLabels = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ];

    for (let mois = 0; mois < 12; mois++) {
      const debut = new Date(annee, mois, 1);
      const fin = new Date(annee, mois + 1, 1);
      const plage = { gte: debut, lt: fin };

      const [consultations, nouveauxPatients, factures] = await Promise.all([
        this.prisma.consultation.count({
          where: { medecinId, dateHeure: plage },
        }),
        this.prisma.patient.count({
          where: { medecinTraitantId: medecinId, createdAt: plage },
        }),
        this.prisma.facture.findMany({
          where: { medecinId, createdAt: plage },
          select: { montantTotalDzd: true },
        }),
      ]);

      const revenusDzd = factures.reduce((acc, f) => acc + f.montantTotalDzd, 0);

      evolution.push({
        mois: mois + 1,
        libelleMois: moisLabels[mois],
        consultations,
        nouveauxPatients,
        revenusDzd: Math.round(revenusDzd * 100) / 100,
      });
    }

    this.logger.log(`Évolution mensuelle ${annee} pour médecin ${medecinId}`);
    return { annee, evolution };
  }
}
