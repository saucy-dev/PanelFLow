import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const panelLoginSchema = z.object({
  panelCode: z.string().min(1, 'Panel code is required').toUpperCase(),
  pin: z.string().optional(),
});

export const studentLookupSchema = z.object({
  registrationNumber: z.string().min(2, 'Registration number is required').toUpperCase(),
});
