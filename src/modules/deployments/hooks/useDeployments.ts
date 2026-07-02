import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deploymentService } from '@/services/deployment.service';
import toast from 'react-hot-toast';

export function useDeploymentTargets() {
  const {
    data: targets = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['deployment-targets'],
    queryFn: () => deploymentService.getTargets(),
    refetchInterval: 10000, // Poll every 10 seconds to detect deployment state changes
  });

  return { targets, isLoading, error, refetch };
}

export function usePm2Status() {
  const {
    data: processes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pm2-status'],
    queryFn: () => deploymentService.getPm2Status(),
    refetchInterval: 8000, // Poll processes every 8 seconds for metrics
  });

  return { processes, isLoading, error, refetch };
}

export function useDeployLogs(target: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['deploy-logs', target],
    queryFn: () =>
      target ? deploymentService.getDeployLogs(target) : Promise.resolve({ target: '', logs: '' }),
    enabled: !!target,
    refetchInterval: (query) => {
      // If we are currently deploying, poll frequently (every 3s)
      const logs = query.state.data?.logs || '';
      const isDeploying =
        logs.includes('🚀 DEPLOYMENT INITIATED') &&
        !logs.includes('✅ DEPLOYMENT SUCCESSFUL') &&
        !logs.includes('❌ DEPLOYMENT FAILED');
      return isDeploying ? 3000 : false;
    },
  });

  return { logs: data?.logs || '', isLoading, error, refetch };
}

export function usePm2Logs(target: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pm2-logs', target],
    queryFn: () =>
      target ? deploymentService.getPm2Logs(target) : Promise.resolve({ target: '', logs: '' }),
    enabled: !!target,
  });

  return { logs: data?.logs || '', isLoading, error, refetch };
}

export function useRestartLogs(target: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['restart-logs', target],
    queryFn: () =>
      target ? deploymentService.getRestartLogs(target) : Promise.resolve({ target: '', logs: '' }),
    enabled: !!target,
  });

  return { logs: data?.logs || '', isLoading, error, refetch };
}

export function useTriggerDeployMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (target: string) => deploymentService.triggerDeploy(target),
    onMutate: () => {
      toast.loading('Initiating deployment in background...', { id: 'deploy-action' });
    },
    onSuccess: (data, target) => {
      toast.success(data.message || 'Deployment triggered successfully!', { id: 'deploy-action' });
      queryClient.invalidateQueries({ queryKey: ['deployment-targets'] });
      queryClient.invalidateQueries({ queryKey: ['deploy-logs', target] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to trigger deployment', { id: 'deploy-action' });
    },
  });
}

export function useRestartPm2Mutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (target: string) => deploymentService.restartPm2(target),
    onMutate: () => {
      toast.loading('Sending restart command to PM2...', { id: 'restart-action' });
    },
    onSuccess: (data, target) => {
      toast.success('Restart command completed.', { id: 'restart-action' });
      queryClient.invalidateQueries({ queryKey: ['pm2-status'] });
      queryClient.invalidateQueries({ queryKey: ['pm2-logs', target] });
      queryClient.invalidateQueries({ queryKey: ['restart-logs', target] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to restart process', { id: 'restart-action' });
    },
  });
}
