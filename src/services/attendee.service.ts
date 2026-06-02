import { apiFetch } from '@/services/apiFetch';
import {
  Attendee,
  AttendeeQueryParams,
  CreateAttendeeInput,
  UpdateAttendeeInput,
  PaginatedAttendeesResponse,
} from '@/modules/attendees/types/attendee.types';

export const attendeeService = {
  getAttendeesByEvent: async (eventId: string): Promise<Attendee[]> => {
    return apiFetch<Attendee[]>(`/admin/attendees/event/${eventId}`);
  },
  getAttendeeCountByEvent: async (eventId: string): Promise<number> => {
    return apiFetch<number>(`/admin/attendees/event/${eventId}/count`);
  },
  getAttendees: async (params?: AttendeeQueryParams): Promise<PaginatedAttendeesResponse> => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.status) searchParams.append('status', params.status);
      if (params.eventId) searchParams.append('eventId', params.eventId);
      if (params.websiteId) searchParams.append('websiteId', params.websiteId);
    }
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiFetch<PaginatedAttendeesResponse>(`/admin/attendees${queryStr}`);
  },
  getAttendeeById: async (id: string): Promise<Attendee> => {
    return apiFetch<Attendee>(`/admin/attendees/${id}`);
  },
  createAttendee: async (data: CreateAttendeeInput): Promise<Attendee> => {
    return apiFetch<Attendee>('/admin/attendees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateAttendee: async (id: string, data: UpdateAttendeeInput): Promise<Attendee> => {
    return apiFetch<Attendee>(`/admin/attendees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  deleteAttendee: async (id: string): Promise<void> => {
    return apiFetch<void>(`/admin/attendees/${id}`, {
      method: 'DELETE',
    });
  },
  checkInAttendee: async (passCode: string): Promise<Attendee> => {
    return apiFetch<Attendee>(`/admin/attendees/${passCode}/check-in`, {
      method: 'PATCH',
    });
  },
};
