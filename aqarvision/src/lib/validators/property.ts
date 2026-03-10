import { z } from 'zod';

export const propertyFormSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(200),
  transaction_type: z.enum(['sale', 'rent', 'vacation_rent'], {
    required_error: 'Le type de transaction est requis',
  }),
  property_type: z.enum([
    'apartment', 'house', 'villa', 'studio', 'land',
    'commercial', 'office', 'garage', 'warehouse', 'other',
  ], {
    required_error: 'Le type de bien est requis',
  }),
  price: z.coerce.number().positive('Le prix doit être positif'),
  currency: z.string().default('DZD'),
  negotiable: z.boolean().default(false),
  surface: z.coerce.number().positive('La surface doit être positive').nullable().optional(),
  rooms: z.coerce.number().int().min(0).nullable().optional(),
  bedrooms: z.coerce.number().int().min(0).nullable().optional(),
  bathrooms: z.coerce.number().int().min(0).nullable().optional(),
  wilaya: z.string().min(1, 'La wilaya est requise'),
  commune: z.string().nullable().optional(),
  quartier: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  amenities: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'archived', 'sold', 'rented']).default('draft'),
  is_featured: z.boolean().default(false),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;
