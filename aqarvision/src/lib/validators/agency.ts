import { z } from 'zod';

export const agencyBrandingSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  slogan: z.string().max(200).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide').default('#0c1b2a'),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email('Email invalide').nullable().optional(),
  address: z.string().max(300).nullable().optional(),
  wilaya: z.string().nullable().optional(),
  license_number: z.string().max(50).nullable().optional(),
});

export type AgencyBrandingValues = z.infer<typeof agencyBrandingSchema>;

export const agencyLuxuryBrandingSchema = agencyBrandingSchema.extend({
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide').nullable().optional(),
  hero_video_url: z.string().url('URL invalide').nullable().optional(),
  hero_style: z.enum(['color', 'cover', 'video']).default('cover'),
  font_style: z.enum(['modern', 'classic', 'elegant']).default('elegant'),
  theme_mode: z.enum(['light', 'dark']).default('dark'),
  tagline: z.string().max(300).nullable().optional(),
  stats_years: z.coerce.number().int().min(0).max(100).nullable().optional(),
  stats_properties_sold: z.coerce.number().int().min(0).nullable().optional(),
  stats_clients: z.coerce.number().int().min(0).nullable().optional(),
});

export type AgencyLuxuryBrandingValues = z.infer<typeof agencyLuxuryBrandingSchema>;

export const agencyCreateSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets'),
  phone: z.string().min(9).max(20),
  email: z.string().email(),
  wilaya: z.string().min(1),
  address: z.string().max(300).optional(),
  license_number: z.string().max(50).optional(),
});

export type AgencyCreateValues = z.infer<typeof agencyCreateSchema>;
