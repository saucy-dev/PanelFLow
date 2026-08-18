import mongoose from 'mongoose';
import { Panel, IPanel, PanelStatus } from '../models/Panel.js';
import { EventService } from './event.service.js';
import { SessionService } from './session.service.js';
import { emitToSession, emitToAdmin, emitToPanel } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';

export class PanelService {
  static async getAllPanels() {
    const panels = await Panel.find()
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

  static async getPanelById(panelId: string) {
    const query = mongoose.Types.ObjectId.isValid(panelId)
      ? { _id: panelId }
      : { panelCode: panelId.toUpperCase() };

    const panel = await Panel.findOne(query)
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

  static async updateStatus(panelId: string, status: PanelStatus, actor?: { id?: string; name?: string; role?: any }) {
    const session = await SessionService.getActiveSession();

    const panel = await Panel.findById(panelId);
    if (!panel) {
      throw { statusCode: 404, message: 'Panel not found.' };
    }

    const previousStatus = panel.status;
    panel.status = status;
    panel.statusUpdatedAt = new Date();
    await panel.save();

    const populatedPanel = await Panel.findById(panel._id)
      .populate({
        path: 'interviewerIds',
        populate: { path: 'domains' },
      })
      .populate({
        path: 'currentCandidateId',
        populate: { path: 'domainPreferences.domainId' },
      })
      .lean();

    await EventService.logEvent({
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

    emitToSession(session._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToAdmin(SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToPanel(panel._id.toString(), SOCKET_EVENTS.PANEL_STATUS_UPDATED, populatedPanel);

    return populatedPanel;
  }

  static async createPanel(data: {
    panelCode: string;
    name: string;
    roomLocation?: string;
    interviewerIds?: string[];
    status?: PanelStatus;
  }) {
    const existing = await Panel.findOne({ panelCode: data.panelCode.toUpperCase() });
    if (existing) {
      throw { statusCode: 400, message: `Panel with code ${data.panelCode} already exists.` };
    }

    const panel = await Panel.create({
      panelCode: data.panelCode.toUpperCase(),
      name: data.name,
      roomLocation: data.roomLocation || '',
      interviewerIds: (data.interviewerIds || []).map((id) => new mongoose.Types.ObjectId(id)),
      status: data.status || 'AVAILABLE',
    });

    const populated = await Panel.findById(panel._id)
      .populate({
        path: 'interviewerIds',
        populate: { path: 'domains' },
      })
      .lean();

    const session = await SessionService.getActiveSession();
    emitToSession(session._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populated);
    emitToAdmin(SOCKET_EVENTS.PANEL_UPDATED, populated);

    return populated;
  }
}
