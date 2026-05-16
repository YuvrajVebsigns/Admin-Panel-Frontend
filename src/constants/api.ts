export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/admin/auth/login',
    SIGNUP: '/admin/auth/signup',
    LOGOUT: '/admin/auth/logout',
    ME: '/admin/auth/me',
    REFRESH: '/admin/auth/refresh',
    FORGOT_PASSWORD: '/admin/auth/forgot-password',
    VERIFY_OTP: '/admin/auth/verify-otp',
    RESET_PASSWORD: '/admin/auth/reset-password',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  MEDIA: {
    BASE: '/media',
    UPLOAD: '/media/upload',
  },
  ADMIN: {
    MENUS: '/admin/sidebar-menu',
    ROLES: {
      BASE: '/admin/roles',
      BY_ID: (id: string) => `/admin/roles/${id}`,
    },
  },
  SYSTEM: {
    TEST_CONNECTION: '/test-connection',
    HEALTH: '/health',
  },
} as const;
