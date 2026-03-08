// ============================================================
// TabibPro — Service Calendrier Algérien
// Jours fériés nationaux + religieux (calendrier hégirien)
// Weekend : Vendredi (5) + Samedi (6)
// ============================================================

import { Injectable } from '@nestjs/common';

export interface JourFerie {
  date: string;       // Format YYYY-MM-DD
  nomFr: string;
  nomAr: string;
  type: 'national' | 'religieux';
  estVariable: boolean;
}

@Injectable()
export class CalendrierService {
  /**
   * Jours fériés nationaux fixes (dates fixes chaque année).
   */
  private readonly joursNationauxFixes: Omit<JourFerie, 'date' | 'estVariable'>[] = [
    { nomFr: "Jour de l'An", nomAr: "رأس السنة الميلادية", type: 'national' },
    { nomFr: "Fête du Travail", nomAr: "عيد العمال", type: 'national' },
    { nomFr: "Fête de l'Indépendance", nomAr: "عيد الاستقلال", type: 'national' },
    { nomFr: "Fête de la Révolution", nomAr: "عيد الثورة", type: 'national' },
    { nomFr: "Jour de l'An Amazigh", nomAr: "رأس السنة الأمازيغية", type: 'national' },
  ];

  /**
   * Vérifie si une date tombe un jour férié algérien.
   * Note : les fêtes religieuses nécessitent une base de données mise à jour annuellement
   * car elles suivent le calendrier hégirien (lunaire).
   */
  isJourFerieDZ(date: Date, joursFeriers: JourFerie[]): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return joursFeriers.some((j) => j.date === dateStr);
  }

  /**
   * Vérifie si c'est le weekend algérien (Vendredi ou Samedi).
   * En Algérie : vendredi = jour de prière (congé), samedi = congé.
   * Dimanche à jeudi = jours ouvrables.
   */
  isWeekendDZ(date: Date): boolean {
    const day = date.getDay();
    return day === 5 || day === 6; // 5=Vendredi, 6=Samedi
  }

  /**
   * Vérifie si c'est un jour ouvrable en Algérie.
   */
  isJourOuvrableDZ(date: Date, joursFeriers: JourFerie[] = []): boolean {
    return !this.isWeekendDZ(date) && !this.isJourFerieDZ(date, joursFeriers);
  }

  /**
   * Retourne le prochain jour ouvrable à partir d'une date donnée.
   */
  prochainJourOuvrable(date: Date, joursFeriers: JourFerie[] = []): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    while (!this.isJourOuvrableDZ(next, joursFeriers)) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  /**
   * Jours fériés algériens pour une année donnée (partie fixe).
   * Les fêtes religieuses sont à date variable et doivent être chargées depuis la DB.
   */
  getJoursNationauxFixes(annee: number): JourFerie[] {
    return [
      { date: `${annee}-01-01`, nomFr: "Jour de l'An", nomAr: "رأس السنة الميلادية", type: 'national', estVariable: false },
      { date: `${annee}-01-12`, nomFr: "Jour de l'An Amazigh (Yennayer)", nomAr: "رأس السنة الأمازيغية", type: 'national', estVariable: false },
      { date: `${annee}-05-01`, nomFr: "Fête du Travail", nomAr: "عيد العمال", type: 'national', estVariable: false },
      { date: `${annee}-06-19`, nomFr: "Réunification Nationale", nomAr: "يوم الانسجام الوطني", type: 'national', estVariable: false },
      { date: `${annee}-07-05`, nomFr: "Fête de l'Indépendance", nomAr: "عيد الاستقلال", type: 'national', estVariable: false },
      { date: `${annee}-11-01`, nomFr: "Fête de la Révolution", nomAr: "عيد الثورة", type: 'national', estVariable: false },
    ];
  }

  /**
   * Calcul des horaires de consultation type en Algérie.
   * Dimanche-Jeudi : 8h-20h (privé), souvent avec pause déjeuner
   * Vendredi-Samedi : repos (weekend algérien)
   */
  getHorairesConsultation(jour: number): { ouvert: boolean; debut?: string; fin?: string } {
    // Vendredi (5) et Samedi (6) : fermé
    if (jour === 5 || jour === 6) return { ouvert: false };
    // Dimanche à Jeudi : ouvert (horaires typiques cabinet privé algérien)
    return { ouvert: true, debut: '08:00', fin: '20:00' };
  }

  /**
   * Formate une date selon la locale algérienne.
   */
  formatDateAlgerie(date: Date, locale: 'fr' | 'ar' = 'fr'): string {
    if (locale === 'ar') {
      return new Intl.DateTimeFormat('ar-DZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Africa/Algiers',
      }).format(date);
    }
    return new Intl.DateTimeFormat('fr-DZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Africa/Algiers',
    }).format(date);
  }
}
