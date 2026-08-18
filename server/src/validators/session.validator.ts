import { z } from 'zod';

export const sessionSettingsSchema = z.object({
  allowStudentRegistration: z.boolean().default(true),
  allowReassignment: z.boolean().default(true),
  showEstimatedWait: z.boolean().default(true),
  strictPanelAvailability: z.boolean().default(true),
  defaultDurationMinutes: z.number().int().positive().default(15),
});

export const createSessionSchema = z.object({
  sessionName: z.string().min(1, 'Session name is required'),
  description: z.string().optional(),
  settings: sessionSettingsSchema.optional(),
});

export const updateSessionSchema = z.object({
  sessionName: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
  settings: sessionSettingsSchema.optional(),
});

export const csvImportSchema = z.object({
  type: z.enum(['students', 'interviewers', 'panels']),
  csvData: z.string().min(1, 'CSV data is required'),
  commit: z.boolean().default(false), // if false, preview validation only
});
