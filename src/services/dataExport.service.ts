import { apiFetchBlob, triggerFileDownload } from '@/services/apiFetch';
import toast from 'react-hot-toast';

export interface ExportFilterParams {
  search?: string;
  websiteId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  categoryId?: string;
  subCategoryId?: string;
  eventId?: string;
  roleId?: string;
  channel?: string;
  type?: string;
  tier?: string;
  companyCategory?: string;
  tag?: string;
  authorId?: string;
  provider?: string;
  [key: string]: unknown;
}

const buildQueryString = (params: ExportFilterParams = {}): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

const getTimestamp = (): string => {
  return new Date().toISOString().slice(0, 10);
};

const performExport = async (
  endpoint: string,
  defaultFilename: string,
  params: ExportFilterParams = {},
): Promise<void> => {
  const toastId = toast.loading('Preparing Excel spreadsheet export...');
  try {
    const qs = buildQueryString(params);
    const blob = await apiFetchBlob(`${endpoint}${qs}`);
    const filename = `${defaultFilename}-${getTimestamp()}.xlsx`;
    triggerFileDownload(blob, filename);
    toast.success(`Exported ${filename} successfully!`, { id: toastId });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : 'Failed to export Excel spreadsheet';
    toast.error(errMessage, {
      id: toastId,
    });
    throw error;
  }
};

export const dataExportService = {
  exportBlogs: (params?: ExportFilterParams) =>
    performExport('/admin/export/blogs', 'blogs-export', params),

  exportContacts: (params?: ExportFilterParams) =>
    performExport('/admin/export/contacts', 'contacts-export', params),

  exportSubscribes: (params?: ExportFilterParams) =>
    performExport('/admin/export/subscribes', 'subscribers-export', params),

  exportEvents: (params?: ExportFilterParams) =>
    performExport('/admin/export/events', 'events-export', params),

  exportAttendees: (params?: ExportFilterParams) =>
    performExport('/admin/export/attendees', 'attendees-export', params),

  exportRegistrees: (params?: ExportFilterParams) =>
    performExport('/admin/export/registrees', 'registrees-directory-export', params),

  exportCxoNetwork: (params?: ExportFilterParams) =>
    performExport('/admin/export/cxo-network', 'cxo-network-export', params),

  exportSponsors: (params?: ExportFilterParams) =>
    performExport('/admin/export/sponsors', 'sponsors-export', params),

  exportNominators: (params?: ExportFilterParams) =>
    performExport('/admin/export/nominators', 'nominators-analytics-export', params),

  exportNominees: (params?: ExportFilterParams) =>
    performExport('/admin/export/nominees', 'nominees-analytics-export', params),

  exportNominationCategories: (params?: ExportFilterParams) =>
    performExport('/admin/export/nomination-categories', 'nomination-categories-export', params),

  exportNominationSubCategories: (params?: ExportFilterParams) =>
    performExport(
      '/admin/export/nomination-subcategories',
      'nomination-subcategories-export',
      params,
    ),

  exportReports: (params?: ExportFilterParams) =>
    performExport('/admin/export/reports', 'reports-catalog-export', params),

  exportReportDownloaders: (reportId: string, params?: ExportFilterParams) =>
    performExport(
      `/admin/export/reports/${reportId}/downloaders`,
      'report-downloaders-export',
      params,
    ),

  exportMedia: (params?: ExportFilterParams) =>
    performExport('/admin/export/media', 'media-library-export', params),

  exportSystemUsers: (params?: ExportFilterParams) =>
    performExport('/admin/export/system-users', 'system-users-export', params),

  exportRoles: (params?: ExportFilterParams) =>
    performExport('/admin/export/roles', 'roles-permissions-export', params),

  exportWebsites: (params?: ExportFilterParams) =>
    performExport('/admin/export/websites', 'websites-portals-export', params),

  exportWebsitePages: (params?: ExportFilterParams) =>
    performExport('/admin/export/website-pages', 'website-pages-export', params),

  exportSidebarMenu: (params?: ExportFilterParams) =>
    performExport('/admin/export/sidebar-menu', 'sidebar-menu-export', params),

  exportCommunicationLogs: (params?: ExportFilterParams) =>
    performExport('/admin/export/communication-logs', 'communication-logs-export', params),

  exportMessageTemplates: (params?: ExportFilterParams) =>
    performExport('/admin/export/message-templates', 'message-templates-export', params),

  exportWebhookSubscriptions: (params?: ExportFilterParams) =>
    performExport('/admin/export/webhook-subscriptions', 'webhook-subscriptions-export', params),
};
