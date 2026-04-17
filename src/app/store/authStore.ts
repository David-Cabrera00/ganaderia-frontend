import { create } from "zustand";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import type { AuthUser } from "../../features/auth/types/auth.types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  hydrateSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setSession: (token, user) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));

    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.currentUser);

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  hydrateSession: () => {
    const token = localStorage.getItem(STORAGE_KEYS.accessToken);
    const rawUser = localStorage.getItem(STORAGE_KEYS.currentUser);

    if (!token || !rawUser) {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
      return;
    }

    try {
      const user = JSON.parse(rawUser) as AuthUser;

      set({
        token,
        user,
        isAuthenticated: true,
      });
    } catch {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.currentUser);

      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));