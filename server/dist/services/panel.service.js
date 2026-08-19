"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Panel_js_1 = require("../models/Panel.js");
const Interviewer_js_1 = require("../models/Interviewer.js");
const event_service_js_1 = require("./event.service.js");
const session_service_js_1 = require("./session.service.js");
const socketHandler_js_1 = require("../sockets/socketHandler.js");
const socketEvents_js_1 = require("../sockets/socketEvents.js");
class PanelService {
    static async getAllPanels() {
        const panels = await Panel_js_1.Panel.find()
            .populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        })
            .populate({
            path: 'currentCandidateId',
            populate: { path: 'domainPreferences.domainId' },
        })
            .populate('currentAssignmentId')
            .sort({ panelCode: 1 })
            .lean();
        return panels;
    }
    static async getPanelById(panelId) {
        const query = mongoose_1.default.Types.ObjectId.isValid(panelId)
            ? { _id: panelId }
            : { panelCode: panelId.toUpperCase() };
        const panel = await Panel_js_1.Panel.findOne(query)
            .populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        })
            .populate({
            path: 'currentCandidateId',
            populate: { path: 'domainPreferences.domainId' },
        })
            .populate('currentAssignmentId')
            .lean();
        if (!panel) {
            throw { statusCode: 404, message: 'Panel not found.' };
        }
        return panel;
    }
    static async updateStatus(panelId, status, actor) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        const panel = await Panel_js_1.Panel.findById(panelId);
        if (!panel) {
            throw { statusCode: 404, message: 'Panel not found.' };
        }
        const previousStatus = panel.status;
        panel.status = status;
        panel.statusUpdatedAt = new Date();
        await panel.save();
        const populatedPanel = await Panel_js_1.Panel.findById(panel._id)
            .populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        })
            .populate({
            path: 'currentCandidateId',
            populate: { path: 'domainPreferences.domainId' },
        })
            .lean();
        await event_service_js_1.EventService.logEvent({
            sessionId: session._id,
            actorId: actor?.id,
            actorName: actor?.name,
            actorRole: actor?.role || 'ADMIN',
            eventType: 'PANEL_STATUS_CHANGED',
            entityType: 'PANEL',
            entityId: panel._id,
            metadata: {
                panelCode: panel.panelCode,
                previousStatus,
                newStatus: status,
            },
        });
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToPanel)(panel._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_STATUS_UPDATED, populatedPanel);
        return populatedPanel;
    }
    static async createPanel(data) {
        const existing = await Panel_js_1.Panel.findOne({ panelCode: data.panelCode.toUpperCase() });
        if (existing) {
            throw { statusCode: 400, message: `Panel with code ${data.panelCode} already exists.` };
        }
        const panel = await Panel_js_1.Panel.create({
            panelCode: data.panelCode.toUpperCase(),
            name: data.name,
            roomLocation: data.roomLocation || '',
            interviewerIds: (data.interviewerIds || []).map((id) => new mongoose_1.default.Types.ObjectId(id)),
            status: data.status || 'AVAILABLE',
        });
        const populated = await Panel_js_1.Panel.findById(panel._id)
            .populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        })
            .lean();
        const session = await session_service_js_1.SessionService.getActiveSession();
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populated);
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populated);
        return populated;
    }
    /**
     * Update panel general details (Name and Room Location)
     */
    static async updatePanelDetails(panelId, data, actor) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        const query = mongoose_1.default.Types.ObjectId.isValid(panelId)
            ? { _id: panelId }
            : { panelCode: panelId.toUpperCase() };
        const panel = await Panel_js_1.Panel.findOne(query);
        if (!panel) {
            throw { statusCode: 404, message: 'Panel not found.' };
        }
        if (data.name)
            panel.name = data.name.trim();
        if (data.roomLocation !== undefined)
            panel.roomLocation = data.roomLocation.trim();
        await panel.save();
        const populatedPanel = await Panel_js_1.Panel.findById(panel._id)
            .populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        })
            .populate({
            path: 'currentCandidateId',
            populate: { path: 'domainPreferences.domainId' },
        })
            .lean();
        await event_service_js_1.EventService.logEvent({
            sessionId: session._id,
            actorId: actor?.id,
            actorName: actor?.name,
            actorRole: actor?.role || 'PANEL',
            eventType: 'PANEL_STATUS_CHANGED',
            entityType: 'PANEL',
            entityId: panel._id,
            metadata: {
                panelCode: panel.panelCode,
                updatedFields: data,
            },
        });
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToPanel)(panel._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        return populatedPanel;
    }
    /**
     * Add a new interviewer to a panel with domain specializations
     */
    static async addInterviewer(panelId, data, actor) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        const query = mongoose_1.default.Types.ObjectId.isValid(panelId)
            ? { _id: panelId }
            : { panelCode: panelId.toUpperCase() };
        const panel = await Panel_js_1.Panel.findOne(query);
        if (!panel) {
            throw { statusCode: 404, message: 'Panel not found.' };
        }
        const domainObjectIds = data.domains.map((d) => new mongoose_1.default.Types.ObjectId(d));
        // Create or update interviewer
        let interviewer = await Interviewer_js_1.Interviewer.findOne({ email: data.email.toLowerCase().trim() });
        if (!interviewer) {
            interviewer = await Interviewer_js_1.Interviewer.create({
                name: data.name.trim(),
                email: data.email.toLowerCase().trim(),
                domains: domainObjectIds,
                panelId: panel._id,
            });
        }
        else {
            interviewer.name = data.name.trim();
            interviewer.domains = domainObjectIds;
            interviewer.panelId = panel._id;
            await interviewer.save();
        }
        // Add to panel interviewerIds if not already present
        if (!panel.interviewerIds.some((id) => id.toString() === interviewer._id.toString())) {
            panel.interviewerIds.push(interviewer._id);
            await panel.save();
        }
        const populatedPanel = await Panel_js_1.Panel.findById(panel._id)
            .populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        })
            .populate({
            path: 'currentCandidateId',
            populate: { path: 'domainPreferences.domainId' },
        })
            .lean();
        await event_service_js_1.EventService.logEvent({
            sessionId: session._id,
            actorId: actor?.id,
            actorName: actor?.name,
            actorRole: actor?.role || 'PANEL',
            eventType: 'PANEL_STATUS_CHANGED',
            entityType: 'INTERVIEWER',
            entityId: interviewer._id,
            metadata: {
                panelCode: panel.panelCode,
                interviewerName: interviewer.name,
                action: 'ADDED_TO_PANEL',
            },
        });
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToPanel)(panel._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        return populatedPanel;
    }
    /**
     * Update existing interviewer details and domains
     */
    static async updateInterviewer(interviewerId, data, actor) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        const interviewer = await Interviewer_js_1.Interviewer.findById(interviewerId);
        if (!interviewer) {
            throw { statusCode: 404, message: 'Interviewer not found.' };
        }
        if (data.name)
            interviewer.name = data.name.trim();
        if (data.email)
            interviewer.email = data.email.toLowerCase().trim();
        if (data.domains) {
            interviewer.domains = data.domains.map((d) => new mongoose_1.default.Types.ObjectId(d));
        }
        await interviewer.save();
        let populatedPanel = null;
        if (interviewer.panelId) {
            populatedPanel = await Panel_js_1.Panel.findById(interviewer.panelId)
                .populate({
                path: 'interviewerIds',
                populate: { path: 'domains' },
            })
                .populate({
                path: 'currentCandidateId',
                populate: { path: 'domainPreferences.domainId' },
            })
                .lean();
            if (populatedPanel) {
                (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
                (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
                (0, socketHandler_js_1.emitToPanel)(populatedPanel._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
            }
        }
        return { interviewer, panel: populatedPanel };
    }
    /**
     * Remove interviewer from panel
     */
    static async removeInterviewerFromPanel(panelId, interviewerId, actor) {
        const session = await session_service_js_1.SessionService.getActiveSession();
        const query = mongoose_1.default.Types.ObjectId.isValid(panelId)
            ? { _id: panelId }
            : { panelCode: panelId.toUpperCase() };
        const panel = await Panel_js_1.Panel.findOne(query);
        if (!panel) {
            throw { statusCode: 404, message: 'Panel not found.' };
        }
        panel.interviewerIds = panel.interviewerIds.filter((id) => id.toString() !== interviewerId.toString());
        await panel.save();
        await Interviewer_js_1.Interviewer.findByIdAndUpdate(interviewerId, { panelId: null });
        const populatedPanel = await Panel_js_1.Panel.findById(panel._id)
            .populate({
            path: 'interviewerIds',
            populate: { path: 'domains' },
        })
            .populate({
            path: 'currentCandidateId',
            populate: { path: 'domainPreferences.domainId' },
        })
            .lean();
        await event_service_js_1.EventService.logEvent({
            sessionId: session._id,
            actorId: actor?.id,
            actorName: actor?.name,
            actorRole: actor?.role || 'PANEL',
            eventType: 'PANEL_STATUS_CHANGED',
            entityType: 'PANEL',
            entityId: panel._id,
            metadata: {
                panelCode: panel.panelCode,
                interviewerId,
                action: 'REMOVED_FROM_PANEL',
            },
        });
        (0, socketHandler_js_1.emitToSession)(session._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToAdmin)(socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        (0, socketHandler_js_1.emitToPanel)(panel._id.toString(), socketEvents_js_1.SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        return populatedPanel;
    }
}
exports.PanelService = PanelService;
//# sourceMappingURL=panel.service.js.map