import { apiFetch } from './apiFetch';
import {
  EventManagement,
  CreateEventInput,
  UpdateEventInput,
  EventStatus,
} from '@/modules/events/types/event.types';

export const eventService = {
  getEvents: async (filters: { websiteId?: string; status?: EventStatus } = {}) => {
    const query = new URLSearchParams();
    if (filters.websiteId) query.append('websiteId', filters.websiteId);
    if (filters.status) query.append('status', filters.status);

    return apiFetch<EventManagement[]>(`/event-management?${query.toString()}`);
  },

  getEventById: async (id: string) => {
    return apiFetch<EventManagement>(`/event-management/${id}`);
  },

  getEventBySlug: async (slug: string) => {
    return apiFetch<EventManagement>(`/event-management/slug/${slug}`);
  },

  createEvent: async (data: CreateEventInput) => {
    return apiFetch<EventManagement>('/event-management', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEvent: async (id: string, data: UpdateEventInput) => {
    return apiFetch<EventManagement>(`/event-management/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteEvent: async (id: string) => {
    return apiFetch<void>(`/event-management/${id}`, {
      method: 'DELETE',
    });
  },
};
