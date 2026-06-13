import { apiFetch } from './apiFetch';
import {
  EventManagement,
  CreateEventInput,
  UpdateEventInput,
  EventStatus,
  EventMeeting,
  CreateEventMeetingInput,
  UpdateEventMeetingInput,
} from '@/modules/events/types/event.types';

export const eventService = {
  getEvents: async (filters: { websiteId?: string; status?: EventStatus } = {}) => {
    const query = new URLSearchParams();
    if (filters.websiteId) query.append('websiteId', filters.websiteId);
    if (filters.status) query.append('status', filters.status);

    return apiFetch<EventManagement[]>(`/admin/events?${query.toString()}`);
  },

  getEventById: async (id: string) => {
    return apiFetch<EventManagement>(`/admin/events/${id}`);
  },

  getEventBySlug: async (slug: string) => {
    return apiFetch<EventManagement>(`/website/events/${slug}`);
  },

  createEvent: async (data: CreateEventInput) => {
    return apiFetch<EventManagement>('/admin/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEvent: async (id: string, data: UpdateEventInput) => {
    return apiFetch<EventManagement>(`/admin/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteEvent: async (id: string) => {
    return apiFetch<void>(`/admin/events/${id}`, {
      method: 'DELETE',
    });
  },

  getEventMeetings: async (eventId: string) => {
    return apiFetch<EventMeeting[]>(`/admin/events/${eventId}/meetings`);
  },

  createEventMeeting: async (eventId: string, data: CreateEventMeetingInput) => {
    return apiFetch<EventMeeting>(`/admin/events/${eventId}/meetings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEventMeeting: async (eventId: string, meetingId: string, data: UpdateEventMeetingInput) => {
    return apiFetch<EventMeeting>(`/admin/events/${eventId}/meetings/${meetingId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteEventMeeting: async (eventId: string, meetingId: string) => {
    return apiFetch<void>(`/admin/events/${eventId}/meetings/${meetingId}`, {
      method: 'DELETE',
    });
  },
};
