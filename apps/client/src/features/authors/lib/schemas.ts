import { z } from 'zod';

export const authorSchema = z.object({
  firstName: z
    .string()
    .max(100, 'First name must be at most 100 characters')
    .optional()
    .or(z.literal('')),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be at most 100 characters'),
  birthDate: z.string().optional().or(z.literal('')),
  deathDate: z.string().optional().or(z.literal('')),
});

export type AuthorFormData = z.infer<typeof authorSchema>;
