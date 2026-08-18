import { create } from 'zustand';

interface SocketState {
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  setConnected: (isConnected) => set({ isConnected }),
}));
