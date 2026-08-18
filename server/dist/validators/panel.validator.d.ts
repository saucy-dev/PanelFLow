import { z } from 'zod';
export declare const updatePanelStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["AVAILABLE", "OCCUPIED", "PAUSED", "OFFLINE"]>;
}, "strip", z.ZodTypeAny, {
    status: "AVAILABLE" | "OCCUPIED" | "PAUSED" | "OFFLINE";
}, {
    status: "AVAILABLE" | "OCCUPIED" | "PAUSED" | "OFFLINE";
}>;
export declare const createPanelSchema: z.ZodObject<{
    panelCode: z.ZodString;
    name: z.ZodString;
    roomLocation: z.ZodOptional<z.ZodString>;
    interviewerIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodDefault<z.ZodEnum<["AVAILABLE", "OCCUPIED", "PAUSED", "OFFLINE"]>>;
}, "strip", z.ZodTypeAny, {
    status: "AVAILABLE" | "OCCUPIED" | "PAUSED" | "OFFLINE";
    name: string;
    panelCode: string;
    roomLocation?: string | undefined;
    interviewerIds?: string[] | undefined;
}, {
    name: string;
    panelCode: string;
    status?: "AVAILABLE" | "OCCUPIED" | "PAUSED" | "OFFLINE" | undefined;
    roomLocation?: string | undefined;
    interviewerIds?: string[] | undefined;
}>;
export declare const createInterviewerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    domains: z.ZodArray<z.ZodString, "many">;
    panelId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    domains: string[];
    panelId?: string | null | undefined;
}, {
    name: string;
    email: string;
    domains: string[];
    panelId?: string | null | undefined;
}>;
