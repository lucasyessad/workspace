"use client";

/** Système de favoris et comparaison basé sur localStorage
 * Permet aux visiteurs de sauvegarder et comparer des biens
 * sans nécessiter de compte utilisateur
 */

const CLE_FAVORIS = "aqarvision_favoris";
const CLE_COMPARAISON = "aqarvision_comparaison";
const MAX_COMPARAISON = 3;

/** Bien en favori (données minimales stockées) */
export interface BienFavori {
  id: string;
  titre: string;
  prix: number;
  surface: number;
  type_bien: string;
  photo: string | null;
  wilaya: string;
  commune: string | null;
  slug_agence: string;
  ajouteLe: string;
}

/** Récupérer la liste des favoris */
export function getFavoris(): BienFavori[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CLE_FAVORIS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Vérifier si un bien est en favori */
export function estFavori(id: string): boolean {
  return getFavoris().some((f) => f.id === id);
}

/** Ajouter un bien aux favoris */
export function ajouterFavori(bien: BienFavori): void {
  const favoris = getFavoris();
  if (!favoris.some((f) => f.id === bien.id)) {
    bien.ajouteLe = new Date().toISOString();
    favoris.unshift(bien);
    localStorage.setItem(CLE_FAVORIS, JSON.stringify(favoris));
    // Émettre un événement pour mettre à jour les composants
    window.dispatchEvent(new CustomEvent("favoris-change", { detail: favoris }));
  }
}

/** Retirer un bien des favoris */
export function retirerFavori(id: string): void {
  const favoris = getFavoris().filter((f) => f.id !== id);
  localStorage.setItem(CLE_FAVORIS, JSON.stringify(favoris));
  window.dispatchEvent(new CustomEvent("favoris-change", { detail: favoris }));
}

/** Basculer l'état favori d'un bien */
export function toggleFavori(bien: BienFavori): boolean {
  if (estFavori(bien.id)) {
    retirerFavori(bien.id);
    return false;
  } else {
    ajouterFavori(bien);
    return true;
  }
}

/** Nombre de favoris */
export function compteFavoris(): number {
  return getFavoris().length;
}

// --- Système de comparaison ---

/** Récupérer la liste de comparaison */
export function getComparaison(): BienFavori[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CLE_COMPARAISON);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Vérifier si un bien est dans la comparaison */
export function estEnComparaison(id: string): boolean {
  return getComparaison().some((b) => b.id === id);
}

/** Ajouter un bien à la comparaison (max 3) */
export function ajouterComparaison(bien: BienFavori): {
  succes: boolean;
  message: string;
} {
  const liste = getComparaison();

  if (liste.some((b) => b.id === bien.id)) {
    return { succes: false, message: "Ce bien est déjà dans la comparaison" };
  }

  if (liste.length >= MAX_COMPARAISON) {
    return {
      succes: false,
      message: `Maximum ${MAX_COMPARAISON} biens à comparer. Retirez-en un d'abord.`,
    };
  }

  liste.push(bien);
  localStorage.setItem(CLE_COMPARAISON, JSON.stringify(liste));
  window.dispatchEvent(
    new CustomEvent("comparaison-change", { detail: liste })
  );
  return { succes: true, message: "Bien ajouté à la comparaison" };
}

/** Retirer un bien de la comparaison */
export function retirerComparaison(id: string): void {
  const liste = getComparaison().filter((b) => b.id !== id);
  localStorage.setItem(CLE_COMPARAISON, JSON.stringify(liste));
  window.dispatchEvent(
    new CustomEvent("comparaison-change", { detail: liste })
  );
}

/** Vider la comparaison */
export function viderComparaison(): void {
  localStorage.removeItem(CLE_COMPARAISON);
  window.dispatchEvent(new CustomEvent("comparaison-change", { detail: [] }));
}
