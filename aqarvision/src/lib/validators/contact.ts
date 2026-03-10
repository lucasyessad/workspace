import { z } from 'zod';

export const contactRequestSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  phone: z.string().min(9, 'Numéro invalide').max(20),
  email: z.string().email('Email invalide').nullable().optional(),
  message: z.string().max(2000).nullable().optional(),
  request_type: z.enum(['visit_request', 'info_request', 'general_contact', 'callback_request']).default('info_request'),
  agency_id: z.string().uuid().optional(),
  property_id: z.string().uuid().optional(),
});

export type ContactRequestValues = z.infer<typeof contactRequestSchema>;
