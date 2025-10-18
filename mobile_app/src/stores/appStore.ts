/**
 * Global App Store (Zustand)
 */

import { create } from 'zustand';

interface AppState {
  isReady: boolean;
  user: any | null;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isReady: true,
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

