import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cxoNetworkService, QueryCxoNetworkParams } from '@/services/cxoNetwork.service';
import { CxoNetworkMember } from '../types/cms.types';
import toast from 'react-hot-toast';

export const useCxoNetwork = (params: QueryCxoNetworkParams) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cxo-network-members', params],
    queryFn: () => cxoNetworkService.getCxoNetworkMembers(params),
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => cxoNetworkService.deleteCxoNetworkMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cxo-network-members'] });
      toast.success('Member removed from CXO Network');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete member');
    },
  });

  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  return {
    members: list.map(
      (m: CxoNetworkMember & { _id?: string }): CxoNetworkMember => ({
        ...m,
        id: m.id || m._id || '',
      }),
    ),
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    deleteMember: deleteMemberMutation.mutateAsync,
    isDeleting: deleteMemberMutation.isPending,
  };
};
