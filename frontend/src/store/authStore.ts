import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/api';
import axios from 'axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const saveSession = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  user:            getStoredUser(),
  token:           getStoredToken(),
  isLoading:       false,
  isAuthenticated: !!getStoredToken(),

  // ── Login ──────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });
      const { user, token } = response.data as { user: User; token: string };
      saveSession(token, user);
      set({ user, token, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Register ───────────────────────────────────────────────────────────────
  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await authService.register(data);
      const { user, token } = response.data as { user: User; token: string };
      saveSession(token, user);
      set({ user, token, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout — still clear local state
    } finally {
      clearSession();
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  // ── Check auth (on app load) ───────────────────────────────────────────────
  checkAuth: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    try {
      const response = await authService.me();
      const { user } = response.data as { user: User };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, token });
    } catch (err) {
      // If we get 401, the interceptor will clear storage
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        clearSession();
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },

  // ── Update user in store ───────────────────────────────────────────────────
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },
}));
