import { Server as SocketIOServer } from 'socket.io';
export declare const initSocketServer: (io: SocketIOServer) => SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const getIO: () => SocketIOServer;
export declare const emitToSession: (sessionId: string, event: string, data: any) => void;
export declare const emitToAdmin: (event: string, data: any) => void;
export declare const emitToPanel: (panelId: string, event: string, data: any) => void;
export declare const emitToStudent: (studentId: string, event: string, data: any) => void;
