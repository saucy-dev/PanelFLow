"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvImportSchema = exports.updateSessionSchema = exports.createSessionSchema = exports.sessionSettingsSchema = void 0;
const zod_1 = require("zod");
exports.sessionSettingsSchema = zod_1.z.object({
    allowStudentRegistration: zod_1.z.boolean().default(true),
    allowReassignment: zod_1.z.boolean().default(true),
    showEstimatedWait: zod_1.z.boolean().default(true),
    strictPanelAvailability: zod_1.z.boolean().default(true),
    defaultDurationMinutes: zod_1.z.number().int().positive().default(15),
});
exports.createSessionSchema = zod_1.z.object({
    sessionName: zod_1.z.string().min(1, 'Session name is required'),
    description: zod_1.z.string().optional(),
    settings: exports.sessionSettingsSchema.optional(),
});
exports.updateSessionSchema = zod_1.z.object({
    sessionName: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
    settings: exports.sessionSettingsSchema.optional(),
});
exports.csvImportSchema = zod_1.z.object({
    type: zod_1.z.enum(['students', 'interviewers', 'panels']),
    csvData: zod_1.z.string().min(1, 'CSV data is required'),
    commit: zod_1.z.boolean().default(false), // if false, preview validation only
});
//# sourceMappingURL=session.validator.js.map