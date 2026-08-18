import { z } from 'zod';
export declare const createAssignmentSchema: z.ZodObject<{
    queueEntryId: z.ZodString;
    panelId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    panelId: string;
    queueEntryId: string;
    notes?: string | undefined;
}, {
    panelId: string;
    queueEntryId: string;
    notes?: string | undefined;
}>;
export declare const reassignSchema: z.ZodObject<{
    newPanelId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    newPanelId: string;
    notes?: string | undefined;
}, {
    newPanelId: string;
    notes?: string | undefined;
}>;
export declare const cancelAssignmentSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
    returnToQueue: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    returnToQueue: boolean;
    reason?: string | undefined;
}, {
    reason?: string | undefined;
    returnToQueue?: boolean | undefined;
}>;
