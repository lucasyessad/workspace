// ============================================================
// TabibPro — Service d'Anonymisation
// Les données envoyées à l'IA sont anonymisées (Loi 18-07)
// ============================================================

import { Injectable } from '@nestjs/common';

@Injectable()
export class AnonymisationService {
  /**
   * Anonymise les données avant envoi à l'API IA externe.
   * Conforme à la Loi 18-07 (données sensibles).
   */
  anonymize<T extends Record<string, unknown>>(data: T): T {
    const sensitive = [
      'nom', 'prenom', 'nomFr', 'prenomFr', 'nomAr', 'prenomAr',
      'email', 'telephone', 'telephoneMobile', 'telephoneFixe',
      'adresse', 'adresseLigne1', 'adresseLigne2', 'commune',
      'numeroSecu', 'numeroCasnos', 'numeroCarteChifa',
      'dateNaissance', // garder l'âge calculé
      'lieuNaissance',
      'personne_confiance', 'contact_urgence',
    ];

    const result = { ...data };

    for (const key of Object.keys(result)) {
      const lowerKey = key.toLowerCase();
      if (sensitive.some((s) => lowerKey.includes(s.toLowerCase()))) {
        (result as Record<string, unknown>)[key] = '[ANONYMISÉ]';
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        (result as Record<string, unknown>)[key] = this.anonymize(
          result[key] as Record<string, unknown>
        );
      }
    }

    return result;
  }

  /**
   * Masque un identifiant pour les logs.
   */
  maskId(id: string): string {
    if (!id || id.length < 8) return '****';
    return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
  }
}
