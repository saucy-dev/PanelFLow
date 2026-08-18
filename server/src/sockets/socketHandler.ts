import { Server as SocketIOServer, Socket } from 'socket.io';
import { SOCKET_EVENTS } from './socketEvents.js';

let ioInstance: SocketIOServer | null = null;

export const initSocketServer = (io: SocketIOServer) => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join Session Room (e.g. for general session updates)
    socket.on(SOCKET_EVENTS.JOIN_SESSION, (sessionId: string) => {
      if (sessionId) {
        const room = `session:${sessionId}`;
        socket.join(room);
        console.log(`👤 Socket ${socket.id} joined ${room}`);
      }
    });

    // Join Panel Room
    socket.on(SOCKET_EVENTS.JOIN_PANEL, ({ panelId, sessionId }: { panelId: string; sessionId?: string }) => {
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
    socket.on(SOCKET_EVENTS.JOIN_STUDENT, ({ studentId, sessionId }: { studentId: string; sessionId?: string }) => {
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
    socket.on(SOCKET_EVENTS.JOIN_ADMIN, (sessionId?: string) => {
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

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized!');
  }
  return ioInstance;
};

export const emitToSession = (sessionId: string, event: string, data: any) => {
  if (ioInstance) {
    ioInstance.to(`session:${sessionId}`).emit(event, data);
    ioInstance.to('admin').emit(event, data);
  }
};

export const emitToAdmin = (event: string, data: any) => {
  if (ioInstance) {
    ioInstance.to('admin').emit(event, data);
  }
};

export const emitToPanel = (panelId: string, event: string, data: any) => {
  if (ioInstance) {
    ioInstance.to(`panel:${panelId}`).emit(event, data);
  }
};

export const emitToStudent = (studentId: string, event: string, data: any) => {
  if (ioInstance) {
    ioInstance.to(`student:${studentId}`).emit(event, data);
  }
};
