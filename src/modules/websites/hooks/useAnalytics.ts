import { useQuery } from '@tanstack/react-query';
import { analyticsService, AnalyticsQuery } from '@/services/analytics.service';

export const useAnalytics = (websiteId: string, params: AnalyticsQuery = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics-summary', websiteId, params],
    queryFn: () => analyticsService.getSummary(websiteId, params),
    enabled: !!websiteId,
    refetchInterval: 15000, // Refresh automatically every 15 seconds for semi-real-time feel!
  });

  return {
    summary: data,
    isLoading,
    error,
    refetch,
  };
};
