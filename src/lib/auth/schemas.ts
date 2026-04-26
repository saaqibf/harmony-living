/**
 * Zod validation schemas for auth forms.
 * Safe to import from both client components and server route handlers.
 * No server-only imports here.
 */
import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

export const signUpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
    terms: z.literal(true, {
      error: () => ({ message: 'You must accept the terms to continue' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const confirmSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Confirmation code must be exactly 6 digits'),
});

export const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ConfirmInput = z.infer<typeof confirmSchema>;
