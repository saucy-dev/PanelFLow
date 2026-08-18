"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeQueueSchema = exports.joinQueueSchema = void 0;
const zod_1 = require("zod");
exports.joinQueueSchema = zod_1.z.object({
    sessionId: zod_1.z.string().optional(),
    registrationNumber: zod_1.z.string().min(1, 'Registration number is required').toUpperCase(),
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    branch: zod_1.z.string().min(1, 'Branch is required'),
    year: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
    phone: zod_1.z.string().optional(),
    domainPreferences: zod_1.z
        .array(zod_1.z.object({
        domainId: zod_1.z.string().min(1, 'Domain is required'),
        priority: zod_1.z.number().int().positive(),
    }))
        .min(1, 'Please select at least one domain preference')
        .max(5, 'Maximum 5 preferences allowed'),
});
exports.removeQueueSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
});
//# sourceMappingURL=queue.validator.js.map