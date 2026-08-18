import { z } from 'zod';
export declare const joinQueueSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    registrationNumber: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    branch: z.ZodString;
    year: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    phone: z.ZodOptional<z.ZodString>;
    domainPreferences: z.ZodArray<z.ZodObject<{
        domainId: z.ZodString;
        priority: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        domainId: string;
        priority: number;
    }, {
        domainId: string;
        priority: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    registrationNumber: string;
    branch: string;
    year: string | number;
    domainPreferences: {
        domainId: string;
        priority: number;
    }[];
    phone?: string | undefined;
    sessionId?: string | undefined;
}, {
    name: string;
    email: string;
    registrationNumber: string;
    branch: string;
    year: string | number;
    domainPreferences: {
        domainId: string;
        priority: number;
    }[];
    phone?: string | undefined;
    sessionId?: string | undefined;
}>;
export declare const removeQueueSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
