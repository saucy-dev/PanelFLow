import { z } from 'zod';

export const createAssignmentSchema = z.object({
  queueEntryId: z.string().min(1, 'Queue entry ID is required'),
  panelId: z.string().min(1, 'Panel ID is required'),
  notes: z.string().optional(),
});

export const reassignSchema = z.object({
  newPanelId: z.string().min(1, 'New panel ID is required'),
  notes: z.string().optional(),
});

export const cancelAssignmentSchema = z.object({
  reason: z.string().optional(),
  returnToQueue: z.boolean().default(true),
});
