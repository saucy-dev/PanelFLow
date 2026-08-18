import { z } from 'zod';

export const updatePanelStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'PAUSED', 'OFFLINE']),
});

export const createPanelSchema = z.object({
  panelCode: z.string().min(1, 'Panel code is required').toUpperCase(),
  name: z.string().min(1, 'Panel name is required'),
  roomLocation: z.string().optional(),
  interviewerIds: z.array(z.string()).optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'PAUSED', 'OFFLINE']).default('AVAILABLE'),
});

export const createInterviewerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  domains: z.array(z.string()).min(1, 'At least one domain is required'),
  panelId: z.string().optional().nullable(),
});
