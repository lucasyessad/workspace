import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ENERGY_LABEL_COLORS: Record<string, string> = {
  A: "bg-[#00a84f] text-white",
  B: "bg-[#52b748] text-white",
  C: "bg-[#c8d200] text-gray-900",
  D: "bg-[#f7e400] text-gray-900",
  E: "bg-[#f0a500] text-white",
  F: "bg-[#e8500a] text-white",
  G: "bg-[#cc0000] text-white",
};

export const ENERGY_LABEL_HEX: Record<string, string> = {
  A: "#00a84f",
  B: "#52b748",
  C: "#c8d200",
  D: "#f7e400",
  E: "#f0a500",
  F: "#e8500a",
  G: "#cc0000",
};

export const MEASURE_LABELS: Record<string, string> = {
  ite: "Isolation Thermique par l'Extérieur",
  isolation_toiture: "Isolation de la toiture",
  isolation_plancher: "Isolation du plancher bas",
  menuiseries: "Remplacement des menuiseries",
  remplacement_chaudiere: "Remplacement chaudière",
  pac: "Installation pompe à chaleur",
  vmc: "VMC double flux",
};

export const AUDIT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-700" },
  in_progress: { label: "En cours", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Terminé", color: "bg-green-100 text-green-700" },
  validated: { label: "Validé", color: "bg-emerald-100 text-emerald-700" },
};

export function formatNumber(n?: number, decimals = 0): string {
  if (n == null) return "—";
  return n.toLocaleString("fr-FR", { maximumFractionDigits: decimals });
}
