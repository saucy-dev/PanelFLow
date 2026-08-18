"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const QueueEntry_js_1 = require("../models/QueueEntry.js");
const Student_js_1 = require("../models/Student.js");
const Domain_js_1 = require("../models/Domain.js");
const session_service_js_1 = require("./session.service.js");
const event_service_js_1 = require("./event.service.js");
const socketHandler_js_1 = require("../sockets/socketHandler.js");
const socketEvents_js_1 = require("../sockets/socketEvents.js");
class QueueService {
    /**
     * Register/Lookup Student and Join Queue with FCFS Number
     */
    static async joinQueue(input, actor) {
        const session = input.sessionId
            ? await session_service_js_1.SessionService.getActiveSession()
            : await session_service_js_1.SessionService.getActiveSession();
        if (session.status !== 'ACTIVE') {
            throw { statusCode: 400, message: 'The interview session is not currently active for registrations.' };
        }
        if (!session.settings.allowStudentRegistration) {
            throw { statusCode: 400, message: 'Student registration is currently closed by the administrator.' };
        }
        const regNo = input.registrationNumber.trim().toUpperCase();
        // 1. Check or Upsert Student
        let student = await Student_js_1.Student.findOne({ registrationNumber: regNo });
        // Validate domain IDs
        const domainIds = input.domainPreferences.map((p) => new mongoose_1.default.Types.ObjectId(p.domainId));
        const validDomains = await Domain_js_1.Domain.find({ _id: { $in: domainIds } });
        if (validDomains.length !== domainIds.length) {
            throw { statusCode: 400, message: 'One or more selected domains are invalid.' };
        }
        const formattedPreferences = input.domainPreferences.map((p) => ({
            domainId: new mongoose_1.default.Types.ObjectId(p.domainId),
            priority: p.priority,
        }));
        if (!student) {
            student = await Student_js_1.Student.create({
                registrationNumber: regNo,
                name: input.name.trim(),
                email: input.email.trim().toLowerCase(),
                branch: input.branch.trim(),
                year: input.year,
                phone: input.phone || '',
                domainPreferences: formattedPreferences,
                status: 'IN_QUEUE',
            });
        }
        else {
            // Update existing student details & preferences
            student.name = input.name.trim();
            student.email = input.email.trim().toLowerCase();
            student.branch = input.branch.trim();
            student.year = input.year;
            student.phone = input.phone || student.phone;
            student.domainPreferences = formattedPreferences;
            student.status = 'IN_QUEUE';
            await student.save();
        }
        // 2. Prevent Duplicate Queue Entries in Active Session
        const activeEntry = await QueueEntry_js_1.QueueEntry.findOne({
            sessionId: session._id,
            studentId: student._id,
            status: { $in: ['WAITING', 'ASSIGNED', 'INTERVIEWING'] },
        }).populate('assignedPanelId');
        if (activeEntry) {
            const countAhead = await QueueEntry_js_1.QueueEntry.countDocuments({
                sessionId: session._id,
                status: 'WAITING',
                queueNumber: { $lt: activeEntry.queueNumber },
            });
            return {
                isExisting: true,
                queueEntry: activeEntry,
                student,
                position: countAhead + 1,
                studentsAhead: countAhead,
                message: `You are already in the queue at position #${activeEntry.queueNumber}.`,
            };
        }
        // 3. Determine Next Immutable FCFS Queue Number
        const highestEntry = await QueueEntry_js_1.QueueEntry.findOne({ sessionId: session._id }).sort({ queueNumber: -1 });
        const nextQueueNumber = highestEntry ? highestEntry.queueNumber + 1 : 1;
        // 4. Create Queue Entry
        const queueEntry = await QueueEntry_js_1.QueueEntry.create({
            sessionId: session._id,
            studentId: student._id,
            queueNumber: nextQueueNumber,
            joinedAt: new Date(),
            status: 'WAITING',
        });
        const populatedEntry = await QueueEntry_js_1.QueueEntry.findById(queueEntry._id)
            .populate({
            path: 'studentId',
            populate: { path: 'domainPreferences.domainId' },
        })
            .lean();
        // 5. Calculate count of students ahead
        const countAhead = await QueueEntry_js_1.QueueEntry.countDocuments({
            sessionId: session._id,
            status: 'WAITING',
            queueNumber: { $lt: nextQueueNumber },
        });
        // 6. Log Event
        await event_service_js_1.EventService.logEvent({
            sessionId: session._id,
            actorId: actor?.id,
            actorName: actor?.name || student.name,
            actorRole: actor?.role || 'STUDENT',
            eventType: 'STUDENT_JOINED_QUEUE',
            entityType: 'QUEUE_ENTRY',
            entityId: queueEntry._id,
            metadata: {
                queueNumber: nextQueueNumber,
                studentName: student.name,
                registrationNumber: student.registrationNumber,
            },
        });
        // 7. Emit Real-time Socket updates
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.QUEUE_UPDATED, {
            queueEntry: populatedEntry,
            action: 'ADDED',
        });
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.QUEUE_UPDATED, {
            queueEntry: populatedEntry,
            action: 'ADDED',
        });
        return {
            isExisting: false,
            queueEntry: populatedEntry,
            student,
            position: countAhead + 1,
            studentsAhead: countAhead,
            message: 'Successfully joined the interview queue!',
        };
    }
    /**
     * Get Live Waiting Queue for a Session
     */
    static async getQueue(sessionId, filterStatus) {
        const session = sessionId
            ? { _id: new mongoose_1.default.Types.ObjectId(sessionId) }
            : await session_service_js_1.SessionService.getActiveSession();
        const query = { sessionId: session._id };
        if (filterStatus) {
            query.status = filterStatus;
        }
        else {
            query.status = { $in: ['WAITING', 'ASSIGNED', 'INTERVIEWING'] };
        }
        const entries = await QueueEntry_js_1.QueueEntry.find(query)
            .sort({ queueNumber: 1 })
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
            .lean();
        return entries;
    }
    /**
     * Get Student Queue Status by Registration Number or Queue ID
     */
    static async getStudentQueueStatus(identifier) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        let query = { sessionId: session._id };
        if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
            query._id = identifier;
        }
        else {
            const student = await Student_js_1.Student.findOne({ registrationNumber: identifier.toUpperCase().trim() });
            if (!student) {
                throw { statusCode: 404, message: 'Student not found.' };
            }
            query.studentId = student._id;
        }
        const entry = await QueueEntry_js_1.QueueEntry.findOne(query)
            .sort({ createdAt: -1 })
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
            .lean();
        if (!entry) {
            throw { statusCode: 404, message: 'No active queue ticket found for this student.' };
        }
        const studentsAhead = await QueueEntry_js_1.QueueEntry.countDocuments({
            sessionId: session._id,
            status: 'WAITING',
            queueNumber: { $lt: entry.queueNumber },
        });
        return {
            queueEntry: entry,
            studentsAhead,
            estimatedWaitMinutes: studentsAhead * (session.settings.defaultDurationMinutes || 15),
        };
    }
    /**
     * Remove Student from Queue (Admin action)
     */
    static async removeFromQueue(queueEntryId, reason, actor) {
        const entry = await QueueEntry_js_1.QueueEntry.findById(queueEntryId).populate('studentId');
        if (!entry) {
            throw { statusCode: 404, message: 'Queue entry not found.' };
        }
        entry.status = 'REMOVED';
        entry.removedAt = new Date();
        entry.removalReason = reason || 'Removed by coordinator';
        await entry.save();
        await Student_js_1.Student.findByIdAndUpdate(entry.studentId, { status: 'CANCELLED' });
        await event_service_js_1.EventService.logEvent({
            sessionId: entry.sessionId,
            actorId: actor?.id,
            actorName: actor?.name,
            actorRole: actor?.role || 'ADMIN',
            eventType: 'STUDENT_REMOVED',
            entityType: 'QUEUE_ENTRY',
            entityId: entry._id,
            metadata: { queueNumber: entry.queueNumber, reason },
        });
        (0, socketHandler_js_1.emitToSession)(entry.sessionId.toString(), socketEvents_js_1.SOCKET_EVENTS.QUEUE_UPDATED, { queueEntry: entry, action: 'REMOVED' });
        (0, socketHandler_js_1.emitToStudent)(entry.studentId._id.toString(), socketEvents_js_1.SOCKET_EVENTS.STUDENT_STATUS_UPDATED, {
            status: 'REMOVED',
            reason,
        });
        return entry;
    }
    /**
     * Restore Removed Student to Queue (Admin action)
     */
    static async restoreToQueue(queueEntryId, actor) {
        const entry = await QueueEntry_js_1.QueueEntry.findById(queueEntryId).populate('studentId');
        if (!entry) {
            throw { statusCode: 404, message: 'Queue entry not found.' };
        }
        entry.status = 'WAITING';
        entry.removedAt = null;
        entry.removalReason = '';
        await entry.save();
        await Student_js_1.Student.findByIdAndUpdate(entry.studentId, { status: 'IN_QUEUE' });
        await event_service_js_1.EventService.logEvent({
            sessionId: entry.sessionId,
            actorId: actor?.id,
            actorName: actor?.name,
            actorRole: actor?.role || 'ADMIN',
            eventType: 'STUDENT_RESTORED',
            entityType: 'QUEUE_ENTRY',
            entityId: entry._id,
            metadata: { queueNumber: entry.queueNumber },
        });
        (0, socketHandler_js_1.emitToSession)(entry.sessionId.toString(), socketEvents_js_1.SOCKET_EVENTS.QUEUE_UPDATED, { queueEntry: entry, action: 'RESTORED' });
        (0, socketHandler_js_1.emitToStudent)(entry.studentId._id.toString(), socketEvents_js_1.SOCKET_EVENTS.STUDENT_STATUS_UPDATED, {
            status: 'WAITING',
        });
        return entry;
    }
}
exports.QueueService = QueueService;
//# sourceMappingURL=queue.service.js.map