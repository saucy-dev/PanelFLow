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

export const updatePanelDetailsSchema = z.object({
  name: z.string().min(1, 'Panel name cannot be empty').optional(),
  roomLocation: z.string().optional(),
});

export const addInterviewerSchema = z.object({
  name: z.string().min(1, 'Interviewer name is required'),
  email: z.string().email('Invalid email address'),
  domains: z.array(z.string()).min(1, 'At least one domain must be selected'),
});

export const updateInterviewerSchema = z.object({
  name: z.string().min(1, 'Interviewer name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  domains: z.array(z.string()).min(1, 'At least one domain must be selected').optional(),
});
