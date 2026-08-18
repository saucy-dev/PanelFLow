"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewService = void 0;
const Panel_js_1 = require("../models/Panel.js");
const QueueEntry_js_1 = require("../models/QueueEntry.js");
const Assignment_js_1 = require("../models/Assignment.js");
const Student_js_1 = require("../models/Student.js");
const session_service_js_1 = require("./session.service.js");
const event_service_js_1 = require("./event.service.js");
const socketHandler_js_1 = require("../sockets/socketHandler.js");
const socketEvents_js_1 = require("../sockets/socketEvents.js");
class InterviewService {
    /**
     * Start Interview (moves status from ASSIGNED -> INTERVIEWING)
     */
    static async startInterview(panelId, actor) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        const panel = await Panel_js_1.Panel.findById(panelId)
            .populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        })
            .populate({
            path: 'currentCandidateId',
            populate: { path: 'domainPreferences.domainId' },
        });
        if (!panel) {
            throw { statusCode: 404, message: 'Panel not found.' };
        }
        if (!panel.currentCandidateId) {
            throw { statusCode: 400, message: 'No candidate currently assigned to this panel.' };
        }
        const studentId = panel.currentCandidateId._id;
        // Update QueueEntry
        const queueEntry = await QueueEntry_js_1.QueueEntry.findOne({
            sessionId: session._id,
            studentId,
            status: 'ASSIGNED',
        });
        if (queueEntry) {
            queueEntry.status = 'INTERVIEWING';
            queueEntry.startedAt = new Date();
            await queueEntry.save();
        }
        // Update Assignment
        const assignment = await Assignment_js_1.Assignment.findOne({
            sessionId: session._id,
            studentId,
            panelId: panel._id,
            status: 'ACTIVE',
        });
        if (assignment) {
            assignment.startedAt = new Date();
            await assignment.save();
        }
        await Student_js_1.Student.findByIdAndUpdate(studentId, { status: 'INTERVIEWING' });
        await event_service_js_1.EventService.logEvent({
            sessionId: session._id,
            actorId: actor?.id,
            actorName: actor?.name,
            actorRole: actor?.role || 'PANEL',
            eventType: 'INTERVIEW_STARTED',
            entityType: 'PANEL',
            entityId: panel._id,
            metadata: {
                panelCode: panel.panelCode,
                studentName: panel.currentCandidateId.name,
            },
        });
        const populatedEntry = queueEntry
            ? await QueueEntry_js_1.QueueEntry.findById(queueEntry._id)
                .populate({
                path: 'studentId',
                populate: { path: 'domainPreferences.domainId' },
            })
                .populate({
                path: 'assignedPanelId',
                populate: {
                    path: 'interviewerIds',
                    populate: { path: 'domains' },
                },
            })
                .lean()
            : null;
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.INTERVIEW_STARTED, {
            panel,
            queueEntry: populatedEntry,
        });
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.INTERVIEW_STARTED, { panel, queueEntry: populatedEntry });
        (0, socketHandler_js_1.emitToPanel)(panel._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, panel);
        (0, socketHandler_js_1.emitToStudent)(studentId.toString(), socketEvents_js_1.SOCKET_EVENTS.STUDENT_STATUS_UPDATED, { status: 'INTERVIEWING' });
        return { panel, queueEntry: populatedEntry };
    }
    /**
     * Complete Interview (frees panel back to AVAILABLE and marks student COMPLETED)
     */
    static async completeInterview(panelId, actor) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        const panel = await Panel_js_1.Panel.findById(panelId);
        if (!panel) {
            throw { statusCode: 404, message: 'Panel not found.' };
        }
        if (!panel.currentCandidateId) {
            // If panel is already available, just return
            return { panel, message: 'Panel is already available.' };
        }
        const studentId = panel.currentCandidateId;
        const now = new Date();
        // 1. Update Assignment
        const assignment = await Assignment_js_1.Assignment.findOne({
            sessionId: session._id,
            studentId,
            panelId: panel._id,
            status: 'ACTIVE',
        });
        let durationMinutes = 0;
        if (assignment) {
            assignment.status = 'COMPLETED';
            assignment.completedAt = now;
            const start = assignment.startedAt || assignment.createdAt;
            durationMinutes = Math.max(1, Math.round((now.getTime() - start.getTime()) / (1000 * 60)));
            assignment.durationMinutes = durationMinutes;
            await assignment.save();
        }
        // 2. Update QueueEntry
        const queueEntry = await QueueEntry_js_1.QueueEntry.findOne({
            sessionId: session._id,
            studentId,
            status: { $in: ['ASSIGNED', 'INTERVIEWING'] },
        });
        if (queueEntry) {
            queueEntry.status = 'COMPLETED';
            queueEntry.completedAt = now;
            await queueEntry.save();
        }
        // 3. Update Student
        const student = await Student_js_1.Student.findByIdAndUpdate(studentId, { status: 'COMPLETED' }, { new: true });
        // 4. Free Panel back to AVAILABLE atomically
        panel.status = 'AVAILABLE';
        panel.currentCandidateId = null;
        panel.currentAssignmentId = null;
        panel.statusUpdatedAt = now;
        await panel.save();
        const populatedPanel = await Panel_js_1.Panel.findById(panel._id)
            .populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        })
            .lean();
        // 5. Log audit event
        await event_service_js_1.EventService.logEvent({
            sessionId: session._id,
            actorId: actor?.id,
            actorName: actor?.name,
            actorRole: actor?.role || 'PANEL',
            eventType: 'INTERVIEW_COMPLETED',
            entityType: 'PANEL',
            entityId: panel._id,
            metadata: {
                panelCode: panel.panelCode,
                studentName: student?.name,
                durationMinutes,
            },
        });
        // 6. Broadcast across all relevant channels
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.INTERVIEW_COMPLETED, {
            panel: populatedPanel,
            studentId,
            durationMinutes,
        });
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.INTERVIEW_COMPLETED, {
            panel: populatedPanel,
            student,
            durationMinutes,
        });
        (0, socketHandler_js_1.emitToPanel)(panel._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToStudent)(studentId.toString(), socketEvents_js_1.SOCKET_EVENTS.STUDENT_STATUS_UPDATED, {
            status: 'COMPLETED',
            durationMinutes,
        });
        return {
            success: true,
            panel: populatedPanel,
            student,
            durationMinutes,
            message: `Interview completed for ${student?.name}. Panel ${panel.panelCode} is now AVAILABLE.`,
        };
    }
}
exports.InterviewService = InterviewService;
//# sourceMappingURL=interview.service.js.map