"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeQueueSchema = exports.joinQueueSchema = void 0;
const zod_1 = require("zod");
exports.joinQueueSchema = zod_1.z
    .object({
    sessionId: zod_1.z.string().optional(),
    registrationNumber: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    branch: zod_1.z.string().optional(),
    year: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
    phone: zod_1.z.string().optional(),
    domainPreferences: zod_1.z
        .array(zod_1.z.object({
        domainId: zod_1.z.string().min(1, 'Domain is required'),
        priority: zod_1.z.number().int().positive(),
    }))
        .optional(),
})
    .refine((data) => (data.registrationNumber && data.registrationNumber.trim().length > 0) || (data.email && data.email.trim().length > 0), {
    message: 'Either Registration Number or Email is required to join queue.',
});
exports.removeQueueSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
});
//# sourceMappingURL=queue.validator.js.map