import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionData, Role } from '../types';

interface AuthState {
  session: SessionData | null;
  isAuthenticated: boolean;
  setSession: (session: SessionData) => void;
  clearSession: () => void;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isAuthenticated: false,

      setSession: (session: SessionData) => {
        set({ session, isAuthenticated: true });
      },

      clearSession: () => {
        set({ session: null, isAuthenticated: false });
      },

      hasRole: (role: Role): boolean => {
        return get().session?.role === role;
      },

      hasAnyRole: (roles: Role[]): boolean => {
        const currentRole = get().session?.role;
        if (!currentRole) return false;
        return roles.includes(currentRole);
      },
    }),
    {
      name: 'ganaderia_session',
      // Only persist what we need
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper to check if stored session is still valid (not expired)
export const isSessionValid = (): boolean => {
  const { session } = useAuthStore.getState();
  if (!session) return false;
  return Date.now() < session.expiresAt;
};
