/** Système de thèmes pour les vitrines d'agences */

export interface ThemeColors {
  /** Couleur principale (fond header/footer) */
  primary: string;
  /** Couleur accent (boutons, badges, icônes) */
  accent: string;
  /** Texte sur fond accent */
  accentForeground: string;
}

export interface ThemeDefinition {
  id: string;
  name: { fr: string; ar: string; en: string };
  colors: ThemeColors;
}

/** Thèmes prédéfinis */
export const THEMES: ThemeDefinition[] = [
  {
    id: "classique",
    name: { fr: "Classique", ar: "كلاسيكي", en: "Classic" },
    colors: {
      primary: "#0c1b2a",
      accent: "#b8963e",
      accentForeground: "#0c1b2a",
    },
  },
  {
    id: "moderne",
    name: { fr: "Moderne", ar: "عصري", en: "Modern" },
    colors: {
      primary: "#18181b",
      accent: "#3b82f6",
      accentForeground: "#ffffff",
    },
  },
  {
    id: "elegant",
    name: { fr: "Élégant", ar: "أنيق", en: "Elegant" },
    colors: {
      primary: "#1e1b4b",
      accent: "#c084fc",
      accentForeground: "#1e1b4b",
    },
  },
  {
    id: "nature",
    name: { fr: "Nature", ar: "طبيعة", en: "Nature" },
    colors: {
      primary: "#14332b",
      accent: "#34d399",
      accentForeground: "#14332b",
    },
  },
  {
    id: "ocean",
    name: { fr: "Océan", ar: "محيط", en: "Ocean" },
    colors: {
      primary: "#0c4a6e",
      accent: "#22d3ee",
      accentForeground: "#0c4a6e",
    },
  },
  {
    id: "terracotta",
    name: { fr: "Terracotta", ar: "تيراكوتا", en: "Terracotta" },
    colors: {
      primary: "#292524",
      accent: "#ea580c",
      accentForeground: "#ffffff",
    },
  },
];

/** Thème par défaut */
export const DEFAULT_THEME_ID = "classique";

/** Récupérer un thème par son ID */
export function getThemeById(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

/** Résoudre les couleurs du thème (gère le cas "custom") */
export function resolveThemeColors(
  themeId: string,
  customPrimary?: string | null,
  customAccent?: string | null
): ThemeColors {
  if (themeId === "custom" && customPrimary && customAccent) {
    return {
      primary: customPrimary,
      accent: customAccent,
      accentForeground: isLightColor(customAccent) ? "#1a1a1a" : "#ffffff",
    };
  }
  return getThemeById(themeId).colors;
}

/** CSS variables à injecter dans le wrapper vitrine */
export function themeToCSS(colors: ThemeColors): Record<string, string> {
  return {
    "--theme-primary": colors.primary,
    "--theme-accent": colors.accent,
    "--theme-accent-fg": colors.accentForeground,
  };
}

/** Déterminer si une couleur hex est claire */
function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
