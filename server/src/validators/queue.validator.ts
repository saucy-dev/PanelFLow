import { z } from 'zod';

export const joinQueueSchema = z
  .object({
    sessionId: z.string().optional(),
    registrationNumber: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
    branch: z.string().optional(),
    year: z.union([z.number(), z.string()]).optional(),
    phone: z.string().optional(),
    domainPreferences: z
      .array(
        z.object({
          domainId: z.string().min(1, 'Domain is required'),
          priority: z.number().int().positive(),
        })
      )
      .optional(),
  })
  .refine((data) => (data.registrationNumber && data.registrationNumber.trim().length > 0) || (data.email && data.email.trim().length > 0), {
    message: 'Either Registration Number or Email is required to join queue.',
  });

export const removeQueueSchema = z.object({
  reason: z.string().optional(),
});
