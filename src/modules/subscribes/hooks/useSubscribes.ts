import { useQuery } from '@tanstack/react-query';
import { subscribeService } from '@/services/subscribe.service';
import { Subscribe, SubscribeQueryParams } from '../types/subscribe.types';
import { PaginatedResponse } from '@/types/api.types';

export const useSubscribes = (params: SubscribeQueryParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse<Subscribe>, Error>({
    queryKey: ['subscribes', params],
    queryFn: () => subscribeService.getSubscribes(params),
  });

  return {
    subscribes: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
};
