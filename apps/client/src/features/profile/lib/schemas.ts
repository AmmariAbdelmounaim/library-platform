import { z } from 'zod';

/**
 * Zod schema for profile form validation
 * Includes password confirmation validation
 */
export const profileSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(100, 'First name must be at most 100 characters'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(100, 'Last name must be at most 100 characters'),
    password: z.string().optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // If password is provided, it must be at least 8 characters
      if (data.password && data.password.length > 0) {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: 'Password must be at least 8 characters',
      path: ['password'],
    },
  )
  .refine(
    (data) => {
      // If password is provided, confirmPassword must match
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    },
  )
  .refine(
    (data) => {
      // If confirmPassword is provided, password must also be provided
      if (data.confirmPassword && data.confirmPassword.length > 0) {
        return data.password && data.password.length > 0;
      }
      return true;
    },
    {
      message: 'Please enter a new password',
      path: ['password'],
    },
  );

/**
 * TypeScript types inferred from the schema
 */
export type ProfileFormData = z.infer<typeof profileSchema>;
