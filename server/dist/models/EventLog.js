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
exports.EventLog = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EventLogSchema = new mongoose_1.Schema({
    sessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InterviewSession', required: true, index: true },
    actorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    actorRole: {
        type: String,
        enum: ['ADMIN', 'PANEL', 'STUDENT', 'SYSTEM'],
        default: 'SYSTEM',
        required: true,
    },
    actorName: { type: String, default: '' },
    eventType: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: mongoose_1.Schema.Types.Mixed, default: null },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
exports.EventLog = mongoose_1.default.model('EventLog', EventLogSchema);
//# sourceMappingURL=EventLog.js.map