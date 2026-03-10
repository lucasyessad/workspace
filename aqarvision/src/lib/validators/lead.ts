import { z } from 'zod';

export const leadFormSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  phone: z.string().min(9, 'Numéro de téléphone invalide').max(20),
  email: z.string().email('Email invalide').nullable().optional(),
  message: z.string().max(2000).nullable().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'visit_scheduled', 'negotiation', 'converted', 'lost']).default('new'),
  source: z.enum(['website', 'phone', 'walk_in', 'referral', 'social_media', 'other']).default('website'),
  notes: z.string().max(2000).nullable().optional(),
  property_id: z.string().uuid().nullable().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
