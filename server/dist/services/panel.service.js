"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Panel_js_1 = require("../models/Panel.js");
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
}
exports.PanelService = PanelService;
//# sourceMappingURL=panel.service.js.map