import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  agency_name: z.string().min(2, 'Le nom de l\'agence est requis').max(100),
  phone: z.string().min(9, 'Numéro invalide').max(20),
  wilaya: z.string().min(1, 'La wilaya est requise'),
});

export type SignupValues = z.infer<typeof signupSchema>;

export const invitationAcceptSchema = z.object({
  full_name: z.string().min(2).max(100),
  password: z.string().min(8),
  token: z.string().min(1),
});

export type InvitationAcceptValues = z.infer<typeof invitationAcceptSchema>;
