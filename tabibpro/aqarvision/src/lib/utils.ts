import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combine les classes CSS avec gestion des conflits Tailwind */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formater un prix en Dinars Algériens */
export function formatPrix(prix: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(prix);
}

/** Formater la surface en m² */
export function formatSurface(surface: number): string {
  return `${surface} m²`;
}

/** Générer un slug URL à partir d'un texte */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Générer le lien WhatsApp pré-rempli */
export function whatsappLink(telephone: string, titre: string): string {
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par votre bien : ${titre}. Est-il toujours disponible ?`
  );
  const numero = telephone.replace(/\s/g, "");
  return `https://wa.me/${numero}?text=${message}`;
}
