import { apiFetch } from './apiFetch';

export interface DeploymentTarget {
  id: string;
  name: string;
  branch: string;
  directory: string;
  command: string;
  pm2ProcessName: string;
  isActive: boolean;
  websiteId?: string;
  status: 'idle' | 'deploying' | 'success' | 'failed';
  lastDeployed?: string;
}

export interface Pm2Process {
  name: string;
  pid?: number;
  pm_id: number;
  status: string;
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
}

export interface LogResponse {
  target: string;
  logs: string;
}

export const deploymentService = {
  getTargets: async (): Promise<DeploymentTarget[]> => {
    return apiFetch<DeploymentTarget[]>('/admin/deployments/targets');
  },

  triggerDeploy: async (target: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch<{ success: boolean; message: string }>(`/admin/deployments/deploy/${target}`, {
      method: 'POST',
    });
  },

  getDeployLogs: async (target: string): Promise<LogResponse> => {
    return apiFetch<LogResponse>(`/admin/deployments/deploy-logs/${target}`);
  },

  getPm2Status: async (): Promise<Pm2Process[]> => {
    return apiFetch<Pm2Process[]>('/admin/deployments/pm2-status');
  },

  getPm2Logs: async (target: string): Promise<LogResponse> => {
    return apiFetch<LogResponse>(`/admin/deployments/pm2-logs/${target}`);
  },

  restartPm2: async (target: string): Promise<LogResponse> => {
    return apiFetch<LogResponse>(`/admin/deployments/restart/${target}`, {
      method: 'POST',
    });
  },

  getRestartLogs: async (target: string): Promise<LogResponse> => {
    return apiFetch<LogResponse>(`/admin/deployments/restart-logs/${target}`);
  },
};
