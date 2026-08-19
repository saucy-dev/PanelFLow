import mongoose from 'mongoose';
import { IPanel, PanelStatus } from '../models/Panel.js';
import { IInterviewer } from '../models/Interviewer.js';
export declare class PanelService {
    static getAllPanels(): Promise<(mongoose.FlattenMaps<IPanel> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    static getPanelById(panelId: string): Promise<mongoose.FlattenMaps<IPanel> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    static updateStatus(panelId: string, status: PanelStatus, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<(mongoose.FlattenMaps<IPanel> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    static createPanel(data: {
        panelCode: string;
        name: string;
        roomLocation?: string;
        interviewerIds?: string[];
        status?: PanelStatus;
    }): Promise<(mongoose.FlattenMaps<IPanel> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    /**
     * Update panel general details (Name and Room Location)
     */
    static updatePanelDetails(panelId: string, data: {
        name?: string;
        roomLocation?: string;
    }, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<(mongoose.FlattenMaps<IPanel> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    /**
     * Add a new interviewer to a panel with domain specializations
     */
    static addInterviewer(panelId: string, data: {
        name: string;
        email: string;
        domains: string[];
    }, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<(mongoose.FlattenMaps<IPanel> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    /**
     * Update existing interviewer details and domains
     */
    static updateInterviewer(interviewerId: string, data: {
        name?: string;
        email?: string;
        domains?: string[];
    }, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<{
        interviewer: mongoose.Document<unknown, {}, IInterviewer, {}, {}> & IInterviewer & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        };
        panel: (mongoose.FlattenMaps<IPanel> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    /**
     * Remove interviewer from panel
     */
    static removeInterviewerFromPanel(panelId: string, interviewerId: string, actor?: {
        id?: string;
        name?: string;
        role?: any;
    }): Promise<(mongoose.FlattenMaps<IPanel> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
