import { apiFetch, apiFetchBlob, triggerFileDownload } from '@/services/apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import {
  CustomForm,
  CreateCustomFormDto,
  UpdateCustomFormDto,
  CustomFormQueryParams,
  FormQuestion,
  FormStatus,
  FormSubmission,
  FormSubmissionQueryParams,
  SubmissionStatus,
  FormSubmissionAnalytics,
  BulkImportFormsPayload,
  BulkImportSubmissionsPayload,
  BulkImportResult,
} from '@/modules/forms/types/form.types';

export const formsService = {
  // Forms CRUD
  getForms: async (params: CustomFormQueryParams = {}): Promise<PaginatedResponse<CustomForm>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.websiteId) queryParams.append('websiteId', params.websiteId);

    return apiFetch<PaginatedResponse<CustomForm>>(`/admin/forms?${queryParams.toString()}`);
  },

  getForm: async (id: string): Promise<CustomForm> => {
    return apiFetch<CustomForm>(`/admin/forms/${id}`);
  },

  createForm: async (data: CreateCustomFormDto): Promise<CustomForm> => {
    return apiFetch<CustomForm>('/admin/forms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateForm: async (id: string, data: UpdateCustomFormDto): Promise<CustomForm> => {
    return apiFetch<CustomForm>(`/admin/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateFormQuestions: async (id: string, questions: FormQuestion[]): Promise<CustomForm> => {
    return apiFetch<CustomForm>(`/admin/forms/${id}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questions }),
    });
  },

  updateFormStatus: async (id: string, status: FormStatus): Promise<CustomForm> => {
    return apiFetch<CustomForm>(`/admin/forms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  duplicateForm: async (id: string): Promise<CustomForm> => {
    return apiFetch<CustomForm>(`/admin/forms/${id}/duplicate`, {
      method: 'POST',
    });
  },

  deleteForm: async (id: string): Promise<void> => {
    return apiFetch<void>(`/admin/forms/${id}`, {
      method: 'DELETE',
    });
  },

  // Submissions
  getSubmissions: async (
    formId: string,
    params: FormSubmissionQueryParams = {},
  ): Promise<PaginatedResponse<FormSubmission>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    return apiFetch<PaginatedResponse<FormSubmission>>(
      `/admin/forms/${formId}/submissions?${queryParams.toString()}`,
    );
  },

  getSubmission: async (formId: string, submissionId: string): Promise<FormSubmission> => {
    return apiFetch<FormSubmission>(`/admin/forms/${formId}/submissions/${submissionId}`);
  },

  updateSubmissionStatus: async (
    formId: string,
    submissionId: string,
    status: SubmissionStatus,
    adminNotes?: string,
  ): Promise<FormSubmission> => {
    return apiFetch<FormSubmission>(`/admin/forms/${formId}/submissions/${submissionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    });
  },

  deleteSubmission: async (formId: string, submissionId: string): Promise<void> => {
    return apiFetch<void>(`/admin/forms/${formId}/submissions/${submissionId}`, {
      method: 'DELETE',
    });
  },

  getSubmissionAnalytics: async (formId: string): Promise<FormSubmissionAnalytics> => {
    return apiFetch<FormSubmissionAnalytics>(`/admin/forms/${formId}/submissions/stats/summary`);
  },

  // Bulk Import Forms
  downloadFormsTemplate: async (websiteId?: string): Promise<void> => {
    const qs = websiteId ? `?websiteId=${websiteId}` : '';
    const blob = await apiFetchBlob(`/admin/forms/bulk-import/template${qs}`);
    triggerFileDownload(blob, `custom-forms-import-template-${Date.now()}.xlsx`);
  },

  bulkImportForms: async (data: BulkImportFormsPayload): Promise<BulkImportResult> => {
    return apiFetch<BulkImportResult>('/admin/forms/bulk-import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Bulk Import Submissions
  downloadSubmissionsTemplate: async (formId: string): Promise<void> => {
    const blob = await apiFetchBlob(`/admin/forms/${formId}/submissions/bulk-import/template`);
    triggerFileDownload(blob, `form-submissions-template-${formId.slice(-6)}-${Date.now()}.xlsx`);
  },

  bulkImportSubmissions: async (
    formId: string,
    data: BulkImportSubmissionsPayload,
  ): Promise<BulkImportResult> => {
    return apiFetch<BulkImportResult>(`/admin/forms/${formId}/submissions/bulk-import`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
