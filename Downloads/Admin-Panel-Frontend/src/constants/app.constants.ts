export const APP_CONFIG = {
  name: 'Core Media',
  description: 'Core Media Administration Dashboard',
  version: '1.0.0',
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const AUTH_COOKIE_NAME = 'cm_auth_token';
export const REFRESH_COOKIE_NAME = 'cm_refresh_token';

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  maxLimit: 100,
} as const;
