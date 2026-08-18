"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueEntry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const QueueEntrySchema = new mongoose_1.Schema({
    sessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InterviewSession', required: true, index: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    queueNumber: { type: Number, required: true, immutable: true }, // NEVER modified after assignment
    joinedAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['WAITING', 'ASSIGNED', 'INTERVIEWING', 'COMPLETED', 'CANCELLED', 'REMOVED'],
        default: 'WAITING',
        index: true,
    },
    assignedPanelId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Panel', default: null },
    assignedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    removedAt: { type: Date, default: null },
    removalReason: { type: String, default: '' },
}, {
    timestamps: true,
});
// Compound index to guarantee uniqueness per session & student while active
QueueEntrySchema.index({ sessionId: 1, studentId: 1, status: 1 });
QueueEntrySchema.index({ sessionId: 1, queueNumber: 1 });
exports.QueueEntry = mongoose_1.default.model('QueueEntry', QueueEntrySchema);
//# sourceMappingURL=QueueEntry.js.map