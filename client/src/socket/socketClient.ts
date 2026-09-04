import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getSocketServerUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    // When running on Vite dev server (default port 5173), connect directly to backend (port 5000)
    // to prevent Vite proxy WebSocket ping timeouts and disconnection loops
    if (window.location.port === '5173') {
      return `http://${window.location.hostname}:5000`;
    }
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export const getSocket = (): Socket => {
  if (!socket) {
    const serverUrl = getSocketServerUrl();

    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to PanelFlow server:', socket?.id);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
  }

  return socket;
};

export const joinRoom = {
  session: (sessionId?: string) => {
    if (!sessionId) return;
    const s = getSocket();
    s.emit('session:join', sessionId);
  },
  admin: (sessionId?: string) => {
    const s = getSocket();
    s.emit('admin:join', sessionId);
  },
  panel: (panelId?: string, sessionId?: string) => {
    if (!panelId) return;
    const s = getSocket();
    s.emit('panel:join', { panelId, sessionId });
  },
  student: (studentId?: string, sessionId?: string) => {
    if (!studentId) return;
    const s = getSocket();
    s.emit('student:join', { studentId, sessionId });
  },
};
