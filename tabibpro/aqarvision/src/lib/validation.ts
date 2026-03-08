/** Validation des données spécifiques au marché algérien */

/** Regex pour les numéros de téléphone algériens
 * Formats acceptés :
 * - +213 5XX XX XX XX (mobile Djezzy/Ooredoo)
 * - +213 6XX XX XX XX (mobile Mobilis)
 * - +213 7XX XX XX XX (mobile Mobilis 4G)
 * - 05XX XX XX XX (format local)
 * - 06XX XX XX XX (format local)
 * - 07XX XX XX XX (format local)
 */
const REGEX_TEL_ALGERIEN = /^(\+213|0)(5|6|7)\d{8}$/;

/** Valider un numéro de téléphone algérien */
export function validerTelephoneAlgerien(numero: string): {
  valide: boolean;
  message: string;
  formate: string;
} {
  // Nettoyer le numéro (espaces, tirets, points)
  const nettoye = numero.replace(/[\s\-\.\(\)]/g, "");

  if (!nettoye) {
    return {
      valide: false,
      message: "Le numéro de téléphone est requis",
      formate: "",
    };
  }

  if (!REGEX_TEL_ALGERIEN.test(nettoye)) {
    return {
      valide: false,
      message:
        "Format invalide. Utilisez : +213 5/6/7XX XX XX XX ou 05/06/07XX XX XX XX",
      formate: "",
    };
  }

  // Formater au format international pour WhatsApp
  let international = nettoye;
  if (international.startsWith("0")) {
    international = "+213" + international.substring(1);
  }

  // Formater pour l'affichage : +213 XX XX XX XX XX
  const affichage = international.replace(
    /^\+213(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/,
    "+213 $1$2 $3 $4 $5"
  );

  return {
    valide: true,
    message: "",
    formate: affichage,
  };
}

/** Formater un numéro pour l'envoi WhatsApp (sans le +) */
export function formatTelWhatsApp(numero: string): string {
  const nettoye = numero.replace(/[\s\-\.\(\)\+]/g, "");
  if (nettoye.startsWith("0")) {
    return "213" + nettoye.substring(1);
  }
  return nettoye;
}

/** Valider le prix (marché algérien) */
export function validerPrix(prix: number, typeTransaction: string): {
  valide: boolean;
  message: string;
} {
  if (prix <= 0) {
    return { valide: false, message: "Le prix doit être supérieur à 0" };
  }

  // Vente : minimum 100 000 DA (réaliste pour le marché algérien)
  if (typeTransaction === "Vente" && prix < 100000) {
    return {
      valide: false,
      message: "Le prix de vente minimum est de 100 000 DA",
    };
  }

  // Location : minimum 5 000 DA/mois
  if (typeTransaction === "Location" && prix < 5000) {
    return {
      valide: false,
      message: "Le loyer minimum est de 5 000 DA/mois",
    };
  }

  return { valide: true, message: "" };
}

/** Valider la surface */
export function validerSurface(surface: number): {
  valide: boolean;
  message: string;
} {
  if (surface <= 0) {
    return { valide: false, message: "La surface doit être supérieure à 0" };
  }
  if (surface > 100000) {
    return {
      valide: false,
      message: "La surface semble trop grande. Vérifiez la valeur.",
    };
  }
  return { valide: true, message: "" };
}

/** Valider un slug URL */
export function validerSlug(slug: string): {
  valide: boolean;
  message: string;
} {
  const REGEX_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  if (!slug) {
    return { valide: false, message: "Le slug est requis" };
  }
  if (slug.length < 3) {
    return { valide: false, message: "Le slug doit contenir au moins 3 caractères" };
  }
  if (slug.length > 50) {
    return { valide: false, message: "Le slug ne doit pas dépasser 50 caractères" };
  }
  if (!REGEX_SLUG.test(slug)) {
    return {
      valide: false,
      message: "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets",
    };
  }
  return { valide: true, message: "" };
}
