import mongoose from 'mongoose';
import { Panel, IPanel, PanelStatus } from '../models/Panel.js';
import { Interviewer, IInterviewer } from '../models/Interviewer.js';
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

  /**
   * Update panel general details (Name and Room Location)
   */
  static async updatePanelDetails(
    panelId: string,
    data: { name?: string; roomLocation?: string },
    actor?: { id?: string; name?: string; role?: any }
  ) {
    const session = await SessionService.getActiveSession();

    const query = mongoose.Types.ObjectId.isValid(panelId)
      ? { _id: panelId }
      : { panelCode: panelId.toUpperCase() };

    const panel = await Panel.findOne(query);
    if (!panel) {
      throw { statusCode: 404, message: 'Panel not found.' };
    }

    if (data.name) panel.name = data.name.trim();
    if (data.roomLocation !== undefined) panel.roomLocation = data.roomLocation.trim();
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
      actorRole: actor?.role || 'PANEL',
      eventType: 'PANEL_STATUS_CHANGED',
      entityType: 'PANEL',
      entityId: panel._id,
      metadata: {
        panelCode: panel.panelCode,
        updatedFields: data,
      },
    });

    emitToSession(session._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToAdmin(SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToPanel(panel._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);

    return populatedPanel;
  }

  /**
   * Add a new interviewer to a panel with domain specializations
   */
  static async addInterviewer(
    panelId: string,
    data: { name: string; email: string; domains: string[] },
    actor?: { id?: string; name?: string; role?: any }
  ) {
    const session = await SessionService.getActiveSession();

    const query = mongoose.Types.ObjectId.isValid(panelId)
      ? { _id: panelId }
      : { panelCode: panelId.toUpperCase() };

    const panel = await Panel.findOne(query);
    if (!panel) {
      throw { statusCode: 404, message: 'Panel not found.' };
    }

    const domainObjectIds = data.domains.map((d) => new mongoose.Types.ObjectId(d));

    // Create or update interviewer
    let interviewer = await Interviewer.findOne({ email: data.email.toLowerCase().trim() });
    if (!interviewer) {
      interviewer = await Interviewer.create({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        domains: domainObjectIds,
        panelId: panel._id,
      });
    } else {
      interviewer.name = data.name.trim();
      interviewer.domains = domainObjectIds;
      interviewer.panelId = panel._id as any;
      await interviewer.save();
    }

    // Add to panel interviewerIds if not already present
    if (!panel.interviewerIds.some((id) => id.toString() === interviewer!._id.toString())) {
      panel.interviewerIds.push(interviewer._id as any);
      await panel.save();
    }

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

    emitToSession(session._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToAdmin(SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToPanel(panel._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);

    return populatedPanel;
  }

  /**
   * Update existing interviewer details and domains
   */
  static async updateInterviewer(
    interviewerId: string,
    data: { name?: string; email?: string; domains?: string[] },
    actor?: { id?: string; name?: string; role?: any }
  ) {
    const session = await SessionService.getActiveSession();

    const interviewer = await Interviewer.findById(interviewerId);
    if (!interviewer) {
      throw { statusCode: 404, message: 'Interviewer not found.' };
    }

    if (data.name) interviewer.name = data.name.trim();
    if (data.email) interviewer.email = data.email.toLowerCase().trim();
    if (data.domains) {
      interviewer.domains = data.domains.map((d) => new mongoose.Types.ObjectId(d)) as any;
    }
    await interviewer.save();

    let populatedPanel = null;
    if (interviewer.panelId) {
      populatedPanel = await Panel.findById(interviewer.panelId)
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
        emitToSession(session._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        emitToAdmin(SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
        emitToPanel(populatedPanel._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
      }
    }

    return { interviewer, panel: populatedPanel };
  }

  /**
   * Remove interviewer from panel
   */
  static async removeInterviewerFromPanel(
    panelId: string,
    interviewerId: string,
    actor?: { id?: string; name?: string; role?: any }
  ) {
    const session = await SessionService.getActiveSession();

    const query = mongoose.Types.ObjectId.isValid(panelId)
      ? { _id: panelId }
      : { panelCode: panelId.toUpperCase() };

    const panel = await Panel.findOne(query);
    if (!panel) {
      throw { statusCode: 404, message: 'Panel not found.' };
    }

    panel.interviewerIds = panel.interviewerIds.filter(
      (id) => id.toString() !== interviewerId.toString()
    );
    await panel.save();

    await Interviewer.findByIdAndUpdate(interviewerId, { panelId: null });

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

    emitToSession(session._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToAdmin(SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);
    emitToPanel(panel._id.toString(), SOCKET_EVENTS.PANEL_UPDATED, populatedPanel);

    return populatedPanel;
  }
}
