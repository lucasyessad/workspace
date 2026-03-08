// ─── Conversions couleur ──────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : null;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ─── Génération des nuances ───────────────────────────────────────────────────

function generateShades(hex: string): Record<number, string> {
  const rgb = hexToRgb(hex);
  if (!rgb) return {};
  const { r, g, b } = rgb;
  const shades: Record<number, [number, number, number]> = {
    50:  [Math.min(255, r + 200), Math.min(255, g + 200), Math.min(255, b + 200)],
    100: [Math.min(255, r + 160), Math.min(255, g + 160), Math.min(255, b + 160)],
    200: [Math.min(255, r + 120), Math.min(255, g + 120), Math.min(255, b + 120)],
    300: [Math.min(255, r + 80),  Math.min(255, g + 80),  Math.min(255, b + 80)],
    400: [Math.min(255, r + 40),  Math.min(255, g + 40),  Math.min(255, b + 40)],
    500: [r, g, b],
    600: [Math.max(0, r - 30),    Math.max(0, g - 30),    Math.max(0, b - 30)],
    700: [Math.max(0, r - 60),    Math.max(0, g - 60),    Math.max(0, b - 60)],
    800: [Math.max(0, r - 90),    Math.max(0, g - 90),    Math.max(0, b - 90)],
    900: [Math.max(0, r - 120),   Math.max(0, g - 120),   Math.max(0, b - 120)],
  };
  const result: Record<number, string> = {};
  for (const [shade, [sr, sg, sb]] of Object.entries(shades)) {
    result[Number(shade)] =
      `#${sr.toString(16).padStart(2, "0")}${sg.toString(16).padStart(2, "0")}${sb.toString(16).padStart(2, "0")}`;
  }
  return result;
}

// ─── Application du thème ─────────────────────────────────────────────────────

export function applyBrandTheme(hex: string) {
  if (typeof document === "undefined") return;

  // 1. Nuances de la brand color (--brand-50 à --brand-900)
  const shades = generateShades(hex);
  const root = document.documentElement;
  for (const [shade, color] of Object.entries(shades)) {
    root.style.setProperty(`--brand-${shade}`, color);
  }

  // 2. Couleurs du sidebar dérivées de la brand color (HSL)
  //    Le sidebar reste toujours sombre mais adopte la teinte de la marque.
  const hsl = hexToHsl(hex);
  if (hsl) {
    const { h } = hsl;
    root.style.setProperty("--sidebar-bg",     hslToHex(h, 45, 10));
    root.style.setProperty("--sidebar-hover",  hslToHex(h, 45, 14));
    root.style.setProperty("--sidebar-active", hslToHex(h, 42, 17));
    root.style.setProperty("--sidebar-border", hslToHex(h, 35, 22));
    root.style.setProperty("--sidebar-text",   hslToHex(h, 30, 65));
    root.style.setProperty("--sidebar-label",  hslToHex(h, 22, 45));
  }
}

// ─── Stockage des paramètres organisation ─────────────────────────────────────

export function storeBrandSettings(settings: {
  brand_color: string;
  organization_name: string;
  logo_url?: string | null;
}) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("org_settings", JSON.stringify(settings));
  // Émettre un événement pour que les composants puissent réagir immédiatement
  window.dispatchEvent(new CustomEvent("brand-settings-changed", { detail: settings }));
}

export function getBrandSettings(): {
  brand_color: string;
  organization_name: string;
  logo_url?: string | null;
} | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem("org_settings");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
