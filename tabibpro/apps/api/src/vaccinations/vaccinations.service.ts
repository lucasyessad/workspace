// ============================================================
// TabibPro — Service Vaccinations
// Calendrier vaccinal PEV algérien (Programme Élargi de Vaccination)
// ============================================================

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';

// Calendrier PEV algérien officiel
const CALENDRIER_PEV_DZ = [
  { vaccin: 'BCG', ageRecommande: 0, unite: 'mois' as const, rappels: [] },
  { vaccin: 'VHB', ageRecommande: 0, unite: 'mois' as const, rappels: [1, 6] },
  { vaccin: 'DTC-Hib-VPO', ageRecommande: 2, unite: 'mois' as const, rappels: [3, 5, 18] },
  { vaccin: 'ROR', ageRecommande: 12, unite: 'mois' as const, rappels: [18] },
  { vaccin: 'DT', ageRecommande: 6, unite: 'ans' as const, rappels: [] },
];

function calculerAgeMois(dateNaissance: Date): number {
  const today = new Date();
  const diffMs = today.getTime() - dateNaissance.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
}

function getDateVaccination(dateNaissance: Date, ageRecommande: number, unite: 'mois' | 'ans'): Date {
  const date = new Date(dateNaissance);
  if (unite === 'mois') {
    date.setMonth(date.getMonth() + ageRecommande);
  } else {
    date.setFullYear(date.getFullYear() + ageRecommande);
  }
  return date;
}

@Injectable()
export class VaccinationsService {
  private readonly logger = new Logger(VaccinationsService.name);

  constructor(private readonly prisma: PrismaMedicalService) {}

  // ---- Calendrier vaccinal d'un patient ----

  async getCalendrierPatient(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        nomFr: true,
        prenomFr: true,
        dateNaissance: true,
        vaccinations: {
          orderBy: { dateVaccination: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient introuvable`);
    }

    const ageMois = calculerAgeMois(patient.dateNaissance);
    const today = new Date();

    // Construire la liste des actes attendus selon le calendrier PEV
    const calendrierPlanifie: Array<{
      vaccin: string;
      datePrevue: Date;
      statut: 'RECU' | 'PLANIFIE' | 'EN_RETARD';
      vaccinationId?: string;
      dateRecue?: Date;
    }> = [];

    for (const entree of CALENDRIER_PEV_DZ) {
      // Dose initiale
      const doses = [entree.ageRecommande, ...entree.rappels];
      for (const age of doses) {
        const datePrevue = getDateVaccination(patient.dateNaissance, age, entree.unite);
        const ageEnMois = entree.unite === 'mois' ? age : age * 12;

        // Recherche si ce vaccin a été reçu (approximation par nom et date)
        const vaccination = patient.vaccinations.find((v) => {
          if (!v.vaccin.toLowerCase().includes(entree.vaccin.toLowerCase()) &&
              !entree.vaccin.toLowerCase().includes(v.vaccin.toLowerCase())) {
            return false;
          }
          const dateRecueMois = calculerAgeMois(new Date(
            patient.dateNaissance.getTime() + (new Date(v.dateVaccination).getTime() - patient.dateNaissance.getTime())
          ));
          // Tolérance de 3 mois autour de la date prévue
          return Math.abs(dateRecueMois - ageEnMois) <= 3;
        });

        if (vaccination) {
          calendrierPlanifie.push({
            vaccin: `${entree.vaccin} (${age} ${entree.unite})`,
            datePrevue,
            statut: 'RECU',
            vaccinationId: vaccination.id,
            dateRecue: vaccination.dateVaccination,
          });
        } else if (ageMois >= ageEnMois) {
          // Age dépassé et vaccin non reçu — en retard
          calendrierPlanifie.push({
            vaccin: `${entree.vaccin} (${age} ${entree.unite})`,
            datePrevue,
            statut: 'EN_RETARD',
          });
        } else {
          // Vaccin à venir
          calendrierPlanifie.push({
            vaccin: `${entree.vaccin} (${age} ${entree.unite})`,
            datePrevue,
            statut: 'PLANIFIE',
          });
        }
      }
    }

    const vaccinationsRecues = patient.vaccinations;

    this.logger.log(`Calendrier vaccinal patient ${patientId} — âge ${ageMois} mois`);
    return {
      patient: {
        id: patient.id,
        nomFr: patient.nomFr,
        prenomFr: patient.prenomFr,
        dateNaissance: patient.dateNaissance,
        ageMois,
      },
      calendrierPev: calendrierPlanifie,
      vaccinationsRecues,
    };
  }

  // ---- Enregistrer un acte vaccinal ----

  async addVaccination(dto: CreateVaccinationDto, medecinId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
      select: { id: true, nomFr: true, prenomFr: true },
    });

    if (!patient) {
      throw new NotFoundException(`Patient introuvable`);
    }

    const vaccination = await this.prisma.vaccination.create({
      data: {
        patientId: dto.patientId,
        medecinId,
        vaccin: dto.vaccin,
        dateVaccination: new Date(dto.dateVaccination),
        lot: dto.lot ?? null,
        site: dto.site ?? null,
        operateur: dto.operateur ?? null,
        reactionObservee: dto.reactionObservee ?? null,
      },
    });

    this.logger.log(
      `Vaccination enregistrée : ${dto.vaccin} pour ${patient.nomFr} ${patient.prenomFr}`
    );
    return vaccination;
  }

  // ---- Patients avec vaccins en retard ----

  async getRetards(medecinId: string) {
    // Récupérer tous les patients actifs du médecin
    const patients = await this.prisma.patient.findMany({
      where: { medecinTraitantId: medecinId, statut: 'ACTIF' },
      select: {
        id: true,
        nomFr: true,
        prenomFr: true,
        dateNaissance: true,
        vaccinations: {
          select: {
            id: true,
            vaccin: true,
            dateVaccination: true,
          },
        },
      },
    });

    const retards: Array<{
      patientId: string;
      nomFr: string;
      prenomFr: string;
      ageMois: number;
      vaccinEnRetard: string;
      datePrevue: Date;
    }> = [];

    for (const patient of patients) {
      const ageMois = calculerAgeMois(patient.dateNaissance);

      for (const entree of CALENDRIER_PEV_DZ) {
        const doses = [entree.ageRecommande, ...entree.rappels];
        for (const age of doses) {
          const ageEnMois = entree.unite === 'mois' ? age : age * 12;

          // Seulement si l'âge est dépassé
          if (ageMois < ageEnMois) continue;

          const datePrevue = getDateVaccination(patient.dateNaissance, age, entree.unite);
          const nomVaccin = `${entree.vaccin} (${age} ${entree.unite})`;

          const recu = patient.vaccinations.some((v) => {
            if (!v.vaccin.toLowerCase().includes(entree.vaccin.toLowerCase()) &&
                !entree.vaccin.toLowerCase().includes(v.vaccin.toLowerCase())) {
              return false;
            }
            const dateRecueMois = Math.floor(
              (new Date(v.dateVaccination).getTime() - patient.dateNaissance.getTime()) /
                (1000 * 60 * 60 * 24 * 30.44)
            );
            return Math.abs(dateRecueMois - ageEnMois) <= 3;
          });

          if (!recu) {
            retards.push({
              patientId: patient.id,
              nomFr: patient.nomFr,
              prenomFr: patient.prenomFr,
              ageMois,
              vaccinEnRetard: nomVaccin,
              datePrevue,
            });
          }
        }
      }
    }

    this.logger.log(`Retards vaccinaux : ${retards.length} retards détectés`);
    return retards;
  }
}
