// ============================================================
// TabibPro — Service Stock Cabinet
// Gestion des médicaments et consommables en stock
// ============================================================

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaMedicalService } from '../database/prisma-medical.service';
import { CreateMouvementStockDto } from './dto/create-mouvement-stock.dto';

const JOURS_ALERTE_PEREMPTION = 30;

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(private readonly prisma: PrismaMedicalService) {}

  // ---- Liste du stock avec alertes ----

  async getStock(medecinId: string) {
    const today = new Date();
    const dateAlerte = new Date();
    dateAlerte.setDate(today.getDate() + JOURS_ALERTE_PEREMPTION);

    const articles = await this.prisma.stockArticle.findMany({
      where: { medecinId },
      orderBy: { nomMedicament: 'asc' },
      select: {
        id: true,
        nomMedicament: true,
        quantiteActuelle: true,
        quantiteMinimale: true,
        datePeremption: true,
        fournisseur: true,
        prixAchatDzd: true,
        medicamentId: true,
        updatedAt: true,
      },
    });

    return articles.map((article) => ({
      ...article,
      alerteRupture: article.quantiteActuelle <= article.quantiteMinimale,
      alertePeremption:
        article.datePeremption !== null &&
        article.datePeremption !== undefined &&
        new Date(article.datePeremption) <= dateAlerte,
    }));
  }

  // ---- Ajouter un mouvement de stock ----

  async addMouvement(dto: CreateMouvementStockDto, medecinId: string) {
    let article = await this.prisma.stockArticle.findFirst({
      where: { medicamentId: dto.medicamentId, medecinId },
    });

    if (!article && dto.type === 'ENTREE') {
      const medicament = await this.prisma.medicament.findUnique({
        where: { id: dto.medicamentId },
        select: { nom: true },
      });
      if (!medicament) {
        throw new NotFoundException(`Médicament introuvable`);
      }

      article = await this.prisma.stockArticle.create({
        data: {
          medecinId,
          medicamentId: dto.medicamentId,
          nomMedicament: medicament.nom,
          quantiteActuelle: 0,
          quantiteMinimale: 0,
          prixAchatDzd: dto.prixAchatDzd ?? null,
          fournisseur: dto.fournisseur ?? null,
          datePeremption: dto.datePeremption ? new Date(dto.datePeremption) : null,
        },
      });
    } else if (!article) {
      throw new NotFoundException(`Article en stock introuvable pour ce médicament`);
    }

    // Calculer la nouvelle quantité selon le type de mouvement
    let deltaQuantite: number;
    switch (dto.type) {
      case 'ENTREE':
        deltaQuantite = dto.quantite;
        break;
      case 'SORTIE':
      case 'PEREMPTION':
        deltaQuantite = -dto.quantite;
        break;
      case 'AJUSTEMENT':
        deltaQuantite = dto.quantite - article.quantiteActuelle;
        break;
      default:
        deltaQuantite = 0;
    }

    const nouvelleQuantite = Math.max(0, article.quantiteActuelle + deltaQuantite);

    const mouvement = await this.prisma.mouvementStock.create({
      data: {
        stockArticleId: article.id,
        medecinId,
        medicamentId: dto.medicamentId,
        type: dto.type as any,
        quantite: dto.quantite,
        quantiteAvant: article.quantiteActuelle,
        quantiteApres: nouvelleQuantite,
        prixAchatDzd: dto.prixAchatDzd ?? null,
        fournisseur: dto.fournisseur ?? null,
        motif: dto.motif ?? null,
        datePeremption: dto.datePeremption ? new Date(dto.datePeremption) : null,
      },
    });

    await this.prisma.stockArticle.update({
      where: { id: article.id },
      data: {
        quantiteActuelle: nouvelleQuantite,
        prixAchatDzd: dto.prixAchatDzd ?? article.prixAchatDzd,
        fournisseur: dto.fournisseur ?? article.fournisseur,
        datePeremption: dto.datePeremption
          ? new Date(dto.datePeremption)
          : article.datePeremption,
        updatedAt: new Date(),
      },
    });

    this.logger.log(
      `Mouvement stock [${dto.type}] : ${article.nomMedicament} — ${article.quantiteActuelle} → ${nouvelleQuantite}`
    );
    return mouvement;
  }

  // ---- Articles en alerte (rupture ou péremption proche) ----

  async getAlertes(medecinId: string) {
    const stock = await this.getStock(medecinId);
    return stock.filter((a) => a.alerteRupture || a.alertePeremption);
  }

  // ---- Statistiques stock ----

  async getStats(medecinId: string) {
    const stock = await this.getStock(medecinId);

    const totalArticles = stock.length;
    const enRupture = stock.filter((a) => a.alerteRupture).length;
    const prochesPeremption = stock.filter((a) => a.alertePeremption).length;
    const valeurTotaleDzd = stock.reduce((acc, a) => {
      const valeur = (a.prixAchatDzd || 0) * a.quantiteActuelle;
      return acc + valeur;
    }, 0);

    return {
      totalArticles,
      enRupture,
      prochesPeremption,
      valeurTotaleDzd: Math.round(valeurTotaleDzd * 100) / 100,
    };
  }
}
