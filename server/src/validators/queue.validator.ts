import { z } from 'zod';

export const joinQueueSchema = z.object({
  sessionId: z.string().optional(),
  registrationNumber: z.string().min(1, 'Registration number is required').toUpperCase(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  branch: z.string().min(1, 'Branch is required'),
  year: z.union([z.number(), z.string()]),
  phone: z.string().optional(),
  domainPreferences: z
    .array(
      z.object({
        domainId: z.string().min(1, 'Domain is required'),
        priority: z.number().int().positive(),
      })
    )
    .min(1, 'Please select at least one domain preference')
    .max(5, 'Maximum 5 preferences allowed'),
});

export const removeQueueSchema = z.object({
  reason: z.string().optional(),
});
