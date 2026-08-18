"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const InterviewSession_js_1 = require("../models/InterviewSession.js");
const event_service_js_1 = require("./event.service.js");
const socketHandler_js_1 = require("../sockets/socketHandler.js");
const socketEvents_js_1 = require("../sockets/socketEvents.js");
class SessionService {
    static async getActiveSession() {
        let session = await InterviewSession_js_1.InterviewSession.findOne({ status: 'ACTIVE' }).sort({ createdAt: -1 });
        if (!session) {
            // Find latest session or create a default recruitment session
            session = await InterviewSession_js_1.InterviewSession.findOne().sort({ createdAt: -1 });
            if (!session) {
                session = await InterviewSession_js_1.InterviewSession.create({
                    sessionName: 'Club Recruitment 2026',
                    description: 'Official Club Technical & Domain Recruitment Session',
                    status: 'ACTIVE',
                    settings: {
                        allowStudentRegistration: true,
                        allowReassignment: true,
                        showEstimatedWait: true,
                        strictPanelAvailability: true,
                        defaultDurationMinutes: 15,
                    },
                });
                await event_service_js_1.EventService.logEvent({
                    sessionId: session._id,
                    actorRole: 'SYSTEM',
                    actorName: 'System Setup',
                    eventType: 'SESSION_STARTED',
                    entityType: 'SESSION',
                    entityId: session._id,
                    metadata: { sessionName: session.sessionName },
                });
            }
        }
        return session;
    }
    static async updateSession(sessionId, updateData, actor) {
        const session = await InterviewSession_js_1.InterviewSession.findByIdAndUpdate(sessionId, { $set: updateData }, { new: true });
        if (!session) {
            throw new Error('Session not found');
        }
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.SESSION_UPDATED, session);
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.SESSION_UPDATED, session);
        await event_service_js_1.EventService.logEvent({
            sessionId: session._id,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role || 'ADMIN',
            eventType: 'SESSION_STARTED',
            entityType: 'SESSION',
            entityId: session._id,
            metadata: updateData,
        });
        return session;
    }
}
exports.SessionService = SessionService;
//# sourceMappingURL=session.service.js.map