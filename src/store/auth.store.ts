import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user.types';
import { setCookie, deleteCookie } from '@/lib/utils';

interface AuthState {
  user: User | null;
  role: string | null;
  permissions: string[];
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, access_token: string, refresh_token: string) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
  setPermissions: (permissions: string[], role: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      permissions: [],
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,
      setAuth: (user, access_token, refresh_token) => {
        // Set cookies for middleware/proxy.ts
        setCookie('access_token', access_token);
        setCookie('auth_token', access_token); // fallback if proxy checks for this

        set({
          user,
          access_token,
          refresh_token,
          isAuthenticated: true,
          role: user.role?.name || null,
          permissions: user.role?.permissions || [],
        });
      },
      clearAuth: () => {
        deleteCookie('access_token');
        deleteCookie('auth_token');
        set({
          user: null,
          role: null,
          permissions: [],
          access_token: null,
          refresh_token: null,
          isAuthenticated: false,
        });
      },
      updateUser: (user) =>
        set({
          user,
          role: user.role?.name || null,
          permissions: user.role?.permissions || [],
        }),
      setPermissions: (permissions, role) => set({ permissions, role }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : dummyStorage,
      ),
    },
  ),
);

// Dummy storage for server-side
const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
