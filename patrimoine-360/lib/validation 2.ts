/**
 * Validation structurée avec Zod.
 * Source unique de vérité pour la validation des entrées.
 */

import { z } from "zod";

/** Schéma de validation pour l'analyse IA */
export const analyzeRequestSchema = z.object({
  moduleId: z.number().int().min(1).max(12),
  formData: z.record(z.string(), z.union([z.string(), z.number()])),
});

/** Schéma de validation pour le chat */
export const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(5000),
    })
  ).min(1).max(50),
  context: z.string().max(20000).optional(),
});

/** Schéma de validation pour les objectifs */
export const objectiveSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200),
  category: z.string().min(1),
  targetAmount: z.number().min(0, "Le montant doit être positif"),
  currentAmount: z.number().min(0, "Le montant doit être positif"),
  targetDate: z.string(),
  priority: z.number().int().min(1).max(5),
  notes: z.string().max(1000).optional().default(""),
});

/** Schéma pour les rappels */
export const reminderSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.string(),
  recurring: z.boolean().optional().default(false),
});

/** Extrait les erreurs Zod en messages français lisibles */
export function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((e) => {
    const path = e.path.join(".");
    switch (e.code) {
      case "too_small":
        return `${path}: la valeur est trop petite`;
      case "too_big":
        return `${path}: la valeur est trop grande`;
      case "invalid_type":
        return `${path}: type invalide (attendu: ${e.expected})`;
      default:
        return `${path}: ${e.message}`;
    }
  });
}
