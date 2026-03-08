// ============================================================
// TabibPro — Service Médicaments
// Pharmacopée ANPP algérienne — Recherche, interactions, génériques
// ============================================================

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';

@Injectable()
export class MedicamentsService {
  private readonly logger = new Logger(MedicamentsService.name);

  constructor(private readonly prisma: PrismaMedicalService) {}

  // ---- Recherche médicaments ----

  async search(q: string, wilaya?: string) {
    const where: any = {};

    if (q && q.trim()) {
      const terme = q.trim();
      where.OR = [
        { nom: { contains: terme, mode: 'insensitive' } },
        { dci: { contains: terme, mode: 'insensitive' } },
        { laboratoire: { contains: terme, mode: 'insensitive' } },
        { nomCommercial: { contains: terme, mode: 'insensitive' } },
      ];
    }

    if (wilaya) {
      where.disponibleDz = true;
    }

    const medicaments = await this.prisma.medicament.findMany({
      where,
      take: 50,
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true,
        nomCommercial: true,
        dci: true,
        dosage: true,
        forme: true,
        voieAdministration: true,
        prixPublicDzd: true,
        remboursableCnas: true,
        tauxRemboursementCnas: true,
        disponibleDz: true,
        laboratoire: true,
        conditionnement: true,
        classeTherapeutique: true,
      },
    });

    this.logger.log(`Recherche médicaments : "${q}" — ${medicaments.length} résultats`);
    return medicaments;
  }

  // ---- Détail d'un médicament + alternatives génériques ----

  async findOne(id: string) {
    const medicament = await this.prisma.medicament.findUnique({
      where: { id },
    });

    if (!medicament) {
      throw new NotFoundException(`Médicament introuvable`);
    }

    // Récupérer les génériques associés (par DCI ou medicamentRefId)
    const generiques = await this.prisma.medicament.findMany({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { dci: medicament.dci || undefined },
              { medicamentRefId: id },
            ],
          },
        ],
      },
      select: {
        id: true,
        nom: true,
        nomCommercial: true,
        dci: true,
        dosage: true,
        forme: true,
        prixPublicDzd: true,
        remboursableCnas: true,
        disponibleDz: true,
        laboratoire: true,
      },
    });

    this.logger.log(`Médicament consulté : ${medicament.nom} (${id})`);
    return { ...medicament, alternativesGeneriques: generiques };
  }

  // ---- Recherche d'interactions médicamenteuses ----

  async searchInteractions(medicamentIds: string[]) {
    if (!medicamentIds || medicamentIds.length < 2) {
      return [];
    }

    try {
      // Recherche dans InteractionMedicament si la table existe
      const interactions = await this.prisma.interactionMedicament.findMany({
        where: {
          AND: [
            { medicament1Id: { in: medicamentIds } },
            { medicament2Id: { in: medicamentIds } },
          ],
        },
        include: {
          medicament1: { select: { id: true, nom: true, dci: true } },
          medicament2: { select: { id: true, nom: true, dci: true } },
        },
      });

      this.logger.log(
        `Interactions recherchées pour ${medicamentIds.length} médicaments — ${interactions.length} trouvées`
      );
      return interactions;
    } catch {
      // Table InteractionMedicament inexistante ou autre erreur
      this.logger.warn('Table InteractionMedicament indisponible — retour tableau vide');
      return [];
    }
  }

  // ---- Liste des génériques d'un médicament de référence ----

  async getGeneriques(id: string) {
    const medicamentRef = await this.prisma.medicament.findUnique({
      where: { id },
      select: { id: true, nom: true, dci: true },
    });

    if (!medicamentRef) {
      throw new NotFoundException(`Médicament de référence introuvable`);
    }

    const generiques = await this.prisma.medicament.findMany({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { dci: medicamentRef.dci || undefined },
              { medicamentRefId: id },
            ],
          },
        ],
      },
      orderBy: { prixPublicDzd: 'asc' },
      select: {
        id: true,
        nom: true,
        nomCommercial: true,
        dci: true,
        dosage: true,
        forme: true,
        prixPublicDzd: true,
        remboursableCnas: true,
        tauxRemboursementCnas: true,
        disponibleDz: true,
        laboratoire: true,
      },
    });

    this.logger.log(`Génériques de "${medicamentRef.nom}" : ${generiques.length} trouvés`);
    return { medicamentReference: medicamentRef, generiques };
  }
}
