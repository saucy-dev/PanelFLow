import { z } from 'zod';
export declare const joinQueueSchema: z.ZodEffects<z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    registrationNumber: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
    phone: z.ZodOptional<z.ZodString>;
    domainPreferences: z.ZodOptional<z.ZodArray<z.ZodObject<{
        domainId: z.ZodString;
        priority: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        domainId: string;
        priority: number;
    }, {
        domainId: string;
        priority: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    registrationNumber?: string | undefined;
    branch?: string | undefined;
    year?: string | number | undefined;
    phone?: string | undefined;
    domainPreferences?: {
        domainId: string;
        priority: number;
    }[] | undefined;
    sessionId?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    registrationNumber?: string | undefined;
    branch?: string | undefined;
    year?: string | number | undefined;
    phone?: string | undefined;
    domainPreferences?: {
        domainId: string;
        priority: number;
    }[] | undefined;
    sessionId?: string | undefined;
}>, {
    name?: string | undefined;
    email?: string | undefined;
    registrationNumber?: string | undefined;
    branch?: string | undefined;
    year?: string | number | undefined;
    phone?: string | undefined;
    domainPreferences?: {
        domainId: string;
        priority: number;
    }[] | undefined;
    sessionId?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    registrationNumber?: string | undefined;
    branch?: string | undefined;
    year?: string | number | undefined;
    phone?: string | undefined;
    domainPreferences?: {
        domainId: string;
        priority: number;
    }[] | undefined;
    sessionId?: string | undefined;
}>;
export declare const removeQueueSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
