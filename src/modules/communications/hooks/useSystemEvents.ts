import { useQuery } from '@tanstack/react-query';
import { communicationService } from '@/services/communication.service';

export const useSystemEvents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['system-events'],
    queryFn: () => communicationService.getSystemEvents(),
    staleTime: Infinity,
  });

  return {
    events: data?.events || [],
    categories: data?.categories || {},
    isLoading,
    error,
  };
};
