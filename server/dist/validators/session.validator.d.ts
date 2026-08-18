import { z } from 'zod';
export declare const sessionSettingsSchema: z.ZodObject<{
    allowStudentRegistration: z.ZodDefault<z.ZodBoolean>;
    allowReassignment: z.ZodDefault<z.ZodBoolean>;
    showEstimatedWait: z.ZodDefault<z.ZodBoolean>;
    strictPanelAvailability: z.ZodDefault<z.ZodBoolean>;
    defaultDurationMinutes: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    allowStudentRegistration: boolean;
    allowReassignment: boolean;
    showEstimatedWait: boolean;
    strictPanelAvailability: boolean;
    defaultDurationMinutes: number;
}, {
    allowStudentRegistration?: boolean | undefined;
    allowReassignment?: boolean | undefined;
    showEstimatedWait?: boolean | undefined;
    strictPanelAvailability?: boolean | undefined;
    defaultDurationMinutes?: number | undefined;
}>;
export declare const createSessionSchema: z.ZodObject<{
    sessionName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodObject<{
        allowStudentRegistration: z.ZodDefault<z.ZodBoolean>;
        allowReassignment: z.ZodDefault<z.ZodBoolean>;
        showEstimatedWait: z.ZodDefault<z.ZodBoolean>;
        strictPanelAvailability: z.ZodDefault<z.ZodBoolean>;
        defaultDurationMinutes: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        allowStudentRegistration: boolean;
        allowReassignment: boolean;
        showEstimatedWait: boolean;
        strictPanelAvailability: boolean;
        defaultDurationMinutes: number;
    }, {
        allowStudentRegistration?: boolean | undefined;
        allowReassignment?: boolean | undefined;
        showEstimatedWait?: boolean | undefined;
        strictPanelAvailability?: boolean | undefined;
        defaultDurationMinutes?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    sessionName: string;
    description?: string | undefined;
    settings?: {
        allowStudentRegistration: boolean;
        allowReassignment: boolean;
        showEstimatedWait: boolean;
        strictPanelAvailability: boolean;
        defaultDurationMinutes: number;
    } | undefined;
}, {
    sessionName: string;
    description?: string | undefined;
    settings?: {
        allowStudentRegistration?: boolean | undefined;
        allowReassignment?: boolean | undefined;
        showEstimatedWait?: boolean | undefined;
        strictPanelAvailability?: boolean | undefined;
        defaultDurationMinutes?: number | undefined;
    } | undefined;
}>;
export declare const updateSessionSchema: z.ZodObject<{
    sessionName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "PAUSED", "COMPLETED"]>>;
    settings: z.ZodOptional<z.ZodObject<{
        allowStudentRegistration: z.ZodDefault<z.ZodBoolean>;
        allowReassignment: z.ZodDefault<z.ZodBoolean>;
        showEstimatedWait: z.ZodDefault<z.ZodBoolean>;
        strictPanelAvailability: z.ZodDefault<z.ZodBoolean>;
        defaultDurationMinutes: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        allowStudentRegistration: boolean;
        allowReassignment: boolean;
        showEstimatedWait: boolean;
        strictPanelAvailability: boolean;
        defaultDurationMinutes: number;
    }, {
        allowStudentRegistration?: boolean | undefined;
        allowReassignment?: boolean | undefined;
        showEstimatedWait?: boolean | undefined;
        strictPanelAvailability?: boolean | undefined;
        defaultDurationMinutes?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "PAUSED" | "COMPLETED" | "ACTIVE" | undefined;
    description?: string | undefined;
    sessionName?: string | undefined;
    settings?: {
        allowStudentRegistration: boolean;
        allowReassignment: boolean;
        showEstimatedWait: boolean;
        strictPanelAvailability: boolean;
        defaultDurationMinutes: number;
    } | undefined;
}, {
    status?: "PAUSED" | "COMPLETED" | "ACTIVE" | undefined;
    description?: string | undefined;
    sessionName?: string | undefined;
    settings?: {
        allowStudentRegistration?: boolean | undefined;
        allowReassignment?: boolean | undefined;
        showEstimatedWait?: boolean | undefined;
        strictPanelAvailability?: boolean | undefined;
        defaultDurationMinutes?: number | undefined;
    } | undefined;
}>;
export declare const csvImportSchema: z.ZodObject<{
    type: z.ZodEnum<["students", "interviewers", "panels"]>;
    csvData: z.ZodString;
    commit: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "panels" | "students" | "interviewers";
    csvData: string;
    commit: boolean;
}, {
    type: "panels" | "students" | "interviewers";
    csvData: string;
    commit?: boolean | undefined;
}>;
