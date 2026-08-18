import mongoose from 'mongoose';
import { IPanel, PanelStatus } from '../models/Panel.js';
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
}
