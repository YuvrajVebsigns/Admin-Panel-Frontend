import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { websitePageService } from '@/services/website-page.service';
import { WebsitePage, SeoMeta } from '../types/cms.types';
import toast from 'react-hot-toast';

export const useWebsitePages = (params: {
  siteId: string;
  search?: string;
  status?: string;
  pageType?: string;
  page?: number;
  limit?: number;
}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['website-pages', params],
    queryFn: () => websitePageService.getPages(params),
    enabled: !!params.siteId,
  });

  const createPageMutation = useMutation({
    mutationFn: (data: Partial<WebsitePage>) => websitePageService.createPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
      toast.success('Page created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create page');
    },
  });

  // Silent create — used by auto-save (no toast, no refetch)
  const silentCreatePageMutation = useMutation({
    mutationFn: (data: Partial<WebsitePage>) => websitePageService.createPage(data),
  });

  const updatePageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WebsitePage> }) =>
      websitePageService.updatePage(id, data),
    onSuccess: (updatedPage) => {
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
      queryClient.invalidateQueries({ queryKey: ['website-page', updatedPage.id] });
      toast.success('Page updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update page');
    },
  });

  // Silent update — used by auto-save (no toast, no refetch)
  const silentUpdatePageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WebsitePage> }) =>
      websitePageService.updatePage(id, data),
  });

  const deletePageMutation = useMutation({
    mutationFn: (id: string) => websitePageService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
      toast.success('Page deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete page');
    },
  });

  const publishPageMutation = useMutation({
    mutationFn: (id: string) => websitePageService.publishPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
      toast.success('Page published successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to publish page');
    },
  });

  const unpublishPageMutation = useMutation({
    mutationFn: (id: string) => websitePageService.unpublishPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
      toast.success('Page unpublished successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unpublish page');
    },
  });

  const duplicatePageMutation = useMutation({
    mutationFn: (id: string) => websitePageService.duplicatePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
      toast.success('Page duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to duplicate page');
    },
  });

  const updatePageSeoMutation = useMutation({
    mutationFn: ({ id, seo }: { id: string; seo: Partial<SeoMeta> }) =>
      websitePageService.updatePageSeo(id, seo),
    onSuccess: (updatedPage) => {
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
      queryClient.invalidateQueries({ queryKey: ['website-page', updatedPage.id] });
      toast.success('Page SEO settings saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update SEO');
    },
  });

  return {
    // Normalize: API may return _id instead of id when showMetaData=true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pages: (data?.data || []).map((p: any) => ({ ...p, id: p.id || p._id })),
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    createPage: createPageMutation.mutateAsync,
    silentCreatePage: silentCreatePageMutation.mutateAsync,
    isCreating: createPageMutation.isPending,
    updatePage: updatePageMutation.mutateAsync,
    silentUpdatePage: silentUpdatePageMutation.mutateAsync,
    isUpdating: updatePageMutation.isPending,
    deletePage: deletePageMutation.mutateAsync,
    isDeleting: deletePageMutation.isPending,
    publishPage: publishPageMutation.mutateAsync,
    isPublishing: publishPageMutation.isPending,
    unpublishPage: unpublishPageMutation.mutateAsync,
    isUnpublishing: unpublishPageMutation.isPending,
    duplicatePage: duplicatePageMutation.mutateAsync,
    isDuplicating: duplicatePageMutation.isPending,
    updatePageSeo: updatePageSeoMutation.mutateAsync,
    isUpdatingSeo: updatePageSeoMutation.isPending,
  };
};

export const useWebsitePage = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['website-page', id],
    queryFn: () => websitePageService.getPageById(id),
    enabled: !!id,
  });

  return {
    page: data,
    isLoading,
    error,
  };
};
