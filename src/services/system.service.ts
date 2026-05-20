import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';

export interface ConnectionTestResponse {
  status: 'online' | 'partial_outage' | 'offline';
  message: string;
  services: {
    database: {
      status: 'up' | 'down';
      message?: string;
      type?: 'local' | 'atlas-cluster' | 'custom-server';
      environment?: string;
    };
    redis: { status: 'up' | 'down'; message?: string; type?: 'redis' | 'in-memory' };
    storage: { status: 'up' | 'down'; message?: string; type?: string };
  };
  serverTime: string;
  environment: string;
  connectivity: boolean;
}

export const systemService = {
  testConnection: async (): Promise<ConnectionTestResponse> => {
    return apiFetch<ConnectionTestResponse>(API_ENDPOINTS.SYSTEM.TEST_CONNECTION, {
      requireAuth: false, // Connection test should usually be public
    });
  },

  getHealth: async (): Promise<unknown> => {
    return apiFetch<unknown>(API_ENDPOINTS.SYSTEM.HEALTH, {
      requireAuth: false,
    });
  },
};
