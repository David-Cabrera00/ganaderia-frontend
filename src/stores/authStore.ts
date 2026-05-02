import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionData } from '@/types';

interface AuthState {
  session: SessionData | null;
  setSession: (session: SessionData) => void;
  clearSession: () => void;
  hasAnyRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,

      setSession: (session) => set({ session }),

      clearSession: () => set({ session: null }),

      hasAnyRole: (roles) => {
        const currentRole = get().session?.role;
        if (!currentRole) return false;
        return roles.includes(currentRole);
      },
    }),
    {
      name: 'ganaderia_session',
    },
  ),
);