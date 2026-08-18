"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentLookupSchema = exports.panelLoginSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(4, 'Password must be at least 4 characters'),
});
exports.panelLoginSchema = zod_1.z.object({
    panelCode: zod_1.z.string().min(1, 'Panel code is required').toUpperCase(),
    pin: zod_1.z.string().optional(),
});
exports.studentLookupSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string().min(2, 'Registration number is required').toUpperCase(),
});
//# sourceMappingURL=auth.validator.js.map