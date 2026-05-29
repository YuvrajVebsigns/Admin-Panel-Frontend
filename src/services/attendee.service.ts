import { apiFetch } from '@/services/apiFetch';
import { Attendee } from '@/modules/attendees/types/attendee.types';

export const attendeeService = {
  getAttendeesByEvent: async (eventId: string): Promise<Attendee[]> => {
    return apiFetch<Attendee[]>(`/attendees/event/${eventId}`);
  },
  getAttendeeCountByEvent: async (eventId: string): Promise<number> => {
    return apiFetch<number>(`/attendees/event/${eventId}/count`);
  },
};
