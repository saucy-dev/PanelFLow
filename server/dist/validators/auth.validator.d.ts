import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const panelLoginSchema: z.ZodObject<{
    panelCode: z.ZodString;
    pin: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    panelCode: string;
    pin?: string | undefined;
}, {
    panelCode: string;
    pin?: string | undefined;
}>;
export declare const studentLookupSchema: z.ZodObject<{
    registrationNumber: z.ZodString;
}, "strip", z.ZodTypeAny, {
    registrationNumber: string;
}, {
    registrationNumber: string;
}>;
