"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInterviewerSchema = exports.createPanelSchema = exports.updatePanelStatusSchema = void 0;
const zod_1 = require("zod");
exports.updatePanelStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['AVAILABLE', 'OCCUPIED', 'PAUSED', 'OFFLINE']),
});
exports.createPanelSchema = zod_1.z.object({
    panelCode: zod_1.z.string().min(1, 'Panel code is required').toUpperCase(),
    name: zod_1.z.string().min(1, 'Panel name is required'),
    roomLocation: zod_1.z.string().optional(),
    interviewerIds: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['AVAILABLE', 'OCCUPIED', 'PAUSED', 'OFFLINE']).default('AVAILABLE'),
});
exports.createInterviewerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    domains: zod_1.z.array(zod_1.z.string()).min(1, 'At least one domain is required'),
    panelId: zod_1.z.string().optional().nullable(),
});
//# sourceMappingURL=panel.validator.js.map