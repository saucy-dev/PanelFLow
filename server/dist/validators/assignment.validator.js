"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAssignmentSchema = exports.reassignSchema = exports.createAssignmentSchema = void 0;
const zod_1 = require("zod");
exports.createAssignmentSchema = zod_1.z.object({
    queueEntryId: zod_1.z.string().min(1, 'Queue entry ID is required'),
    panelId: zod_1.z.string().min(1, 'Panel ID is required'),
    notes: zod_1.z.string().optional(),
});
exports.reassignSchema = zod_1.z.object({
    newPanelId: zod_1.z.string().min(1, 'New panel ID is required'),
    notes: zod_1.z.string().optional(),
});
exports.cancelAssignmentSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
    returnToQueue: zod_1.z.boolean().default(true),
});
//# sourceMappingURL=assignment.validator.js.map