import { z } from 'zod';

export const messageSchema = z.object({
  body: z
    .string()
    .min(1, 'Le message ne peut pas être vide')
    .max(2000, 'Le message est trop long (2000 caractères max)'),
});

export type MessageValues = z.infer<typeof messageSchema>;

export const startConversationSchema = z.object({
  agencyId: z.string().uuid(),
  propertyId: z.string().uuid().optional(),
  message: z
    .string()
    .min(1, 'Le message ne peut pas être vide')
    .max(2000, 'Le message est trop long'),
});

export type StartConversationValues = z.infer<typeof startConversationSchema>;
