"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const EventLog_js_1 = require("../models/EventLog.js");
const socketHandler_js_1 = require("../sockets/socketHandler.js");
const socketEvents_js_1 = require("../sockets/socketEvents.js");
class EventService {
    static async logEvent(params) {
        const event = await EventLog_js_1.EventLog.create({
            sessionId: new mongoose_1.default.Types.ObjectId(params.sessionId.toString()),
            actorId: params.actorId ? new mongoose_1.default.Types.ObjectId(params.actorId.toString()) : null,
            actorRole: params.actorRole || 'SYSTEM',
            actorName: params.actorName || (params.actorRole ? params.actorRole : 'System'),
            eventType: params.eventType,
            entityType: params.entityType,
            entityId: params.entityId ? params.entityId.toString() : null,
            metadata: params.metadata || {},
        });
        // Broadcast live event log
        (0, socketHandler_js_1.emitToSession)(params.sessionId.toString(), socketEvents_js_1.SOCKET_EVENTS.EVENT_LOGGED, event);
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.EVENT_LOGGED, event);
        return event;
    }
    static async getSessionEvents(sessionId, limit = 100) {
        return EventLog_js_1.EventLog.find({ sessionId: new mongoose_1.default.Types.ObjectId(sessionId) })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }
}
exports.EventService = EventService;
//# sourceMappingURL=event.service.js.map