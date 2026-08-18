"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToStudent = exports.emitToPanel = exports.emitToAdmin = exports.emitToSession = exports.getIO = exports.initSocketServer = void 0;
const socketEvents_js_1 = require("./socketEvents.js");
let ioInstance = null;
const initSocketServer = (io) => {
    ioInstance = io;
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        // Join Session Room (e.g. for general session updates)
        socket.on(socketEvents_js_1.SOCKET_EVENTS.JOIN_SESSION, (sessionId) => {
            if (sessionId) {
                const room = `session:${sessionId}`;
                socket.join(room);
                console.log(`👤 Socket ${socket.id} joined ${room}`);
            }
        });
        // Join Panel Room
        socket.on(socketEvents_js_1.SOCKET_EVENTS.JOIN_PANEL, ({ panelId, sessionId }) => {
            if (panelId) {
                const room = `panel:${panelId}`;
                socket.join(room);
                console.log(`🎙️ Socket ${socket.id} joined ${room}`);
            }
            if (sessionId) {
                socket.join(`session:${sessionId}`);
            }
        });
        // Join Student Room
        socket.on(socketEvents_js_1.SOCKET_EVENTS.JOIN_STUDENT, ({ studentId, sessionId }) => {
            if (studentId) {
                const room = `student:${studentId}`;
                socket.join(room);
                console.log(`🎓 Socket ${socket.id} joined ${room}`);
            }
            if (sessionId) {
                socket.join(`session:${sessionId}`);
            }
        });
        // Join Admin Room
        socket.on(socketEvents_js_1.SOCKET_EVENTS.JOIN_ADMIN, (sessionId) => {
            socket.join('admin');
            if (sessionId) {
                socket.join(`session:${sessionId}`);
            }
            console.log(`🛡️ Socket ${socket.id} joined admin room`);
        });
        socket.on('disconnect', (reason) => {
            console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
        });
    });
    return io;
};
exports.initSocketServer = initSocketServer;
const getIO = () => {
    if (!ioInstance) {
        throw new Error('Socket.IO is not initialized!');
    }
    return ioInstance;
};
exports.getIO = getIO;
const emitToSession = (sessionId, event, data) => {
    if (ioInstance) {
        ioInstance.to(`session:${sessionId}`).emit(event, data);
        ioInstance.to('admin').emit(event, data);
    }
};
exports.emitToSession = emitToSession;
const emitToAdmin = (event, data) => {
    if (ioInstance) {
        ioInstance.to('admin').emit(event, data);
    }
};
exports.emitToAdmin = emitToAdmin;
const emitToPanel = (panelId, event, data) => {
    if (ioInstance) {
        ioInstance.to(`panel:${panelId}`).emit(event, data);
    }
};
exports.emitToPanel = emitToPanel;
const emitToStudent = (studentId, event, data) => {
    if (ioInstance) {
        ioInstance.to(`student:${studentId}`).emit(event, data);
    }
};
exports.emitToStudent = emitToStudent;
//# sourceMappingURL=socketHandler.js.map