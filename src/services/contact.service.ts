import { apiFetch } from '@/services/apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import {
  Contact,
  ContactQueryParams,
  ReplyContactDto,
} from '../modules/contacts/types/contact.types';

export const contactService = {
  getContacts: async (params: ContactQueryParams = {}): Promise<PaginatedResponse<Contact>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.websiteId) queryParams.append('websiteId', params.websiteId);

    return apiFetch<PaginatedResponse<Contact>>(`/admin/contacts?${queryParams.toString()}`);
  },

  getContact: async (id: string): Promise<Contact> => {
    return apiFetch<Contact>(`/admin/contacts/${id}`);
  },

  replyContact: async (id: string, data: ReplyContactDto): Promise<Contact> => {
    return apiFetch<Contact>(`/admin/contacts/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteContact: async (id: string): Promise<void> => {
    return apiFetch<void>(`/admin/contacts/${id}`, {
      method: 'DELETE',
    });
  },
};
