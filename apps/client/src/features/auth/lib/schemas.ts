import { z } from 'zod';

/**
 * Zod schema for registration form validation
 * Matches the RegisterDto from the API
 */
export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be at most 100 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must be at most 100 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Zod schema for login form validation
 * Matches the LoginDto from the API
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * TypeScript types inferred from the schemas
 */
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
