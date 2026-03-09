import { UserProfile, FormData } from "@/types";

/**
 * Mappe les champs du profil utilisateur vers les champs des modules.
 * Utilisé pour pré-remplir automatiquement les formulaires des modules.
 */
export function mapProfileToModule(profile: UserProfile, moduleId: number): Partial<FormData> {
  const { age, revenus_mensuels, depenses_mensuelles, epargne_totale, dettes_totales, investissements, revenus_annuels, capacite_epargne, statut_fiscal, lieu_residence } = profile;

  const mappings: Record<number, Partial<FormData>> = {
    1: {
      ...(age != null && { age }),
      ...(revenus_mensuels != null && { revenus: revenus_mensuels }),
      ...(depenses_mensuelles != null && { depenses: depenses_mensuelles }),
      ...(epargne_totale != null && { epargne: epargne_totale }),
      ...(dettes_totales != null && { dettes: dettes_totales }),
      ...(investissements != null && { investissements }),
    },
    2: {
      ...(age != null && { age }),
      ...(revenus_annuels != null && { revenus_annuels }),
      ...(capacite_epargne != null && { capacite_epargne }),
    },
    3: {
      ...(age != null && { age }),
      ...(investissements != null && { actifs_investissables: investissements }),
    },
    4: {
      ...(statut_fiscal != null && { statut_fiscal }),
      ...(lieu_residence != null && { lieu_residence }),
    },
    5: {
      ...(revenus_mensuels != null && { revenu_mensuel: revenus_mensuels }),
    },
    6: {
      ...(revenus_mensuels != null && { revenu_mensuel: revenus_mensuels }),
      ...(depenses_mensuelles != null && { depenses_mensuelles }),
      ...(epargne_totale != null && { epargne_urgence: epargne_totale }),
    },
    7: {
      ...(revenus_annuels != null && { revenus_annuels }),
    },
    8: {
      ...(lieu_residence != null && { lieu_residence }),
      ...(revenus_annuels != null && { revenus_foyer: revenus_annuels }),
      ...(capacite_epargne != null && { capacite_epargne }),
    },
    9: {
      ...(lieu_residence != null && { lieu_residence }),
    },
    11: {
      ...(revenus_mensuels != null && { revenu_mensuel: revenus_mensuels }),
    },
    12: {
      ...(age != null && { age }),
      ...(revenus_annuels != null && { revenus_annuels }),
      ...(epargne_totale != null && investissements != null && dettes_totales != null && {
        patrimoine_net: epargne_totale + investissements - dettes_totales,
      }),
    },
  };

  return mappings[moduleId] || {};
}
