import { z } from 'zod';

export const savedSearchSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  frequency: z.enum(['instant', 'daily', 'weekly']).default('daily'),
});

export type SavedSearchValues = z.infer<typeof savedSearchSchema>;
