import { useQuery } from '@tanstack/react-query';
import { attendeeService } from '@/services/attendee.service';

export const useEventAttendees = (eventId: string) => {
  return useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: () => attendeeService.getAttendeesByEvent(eventId),
    enabled: !!eventId,
  });
};

export const useEventAttendeeCount = (eventId: string) => {
  return useQuery({
    queryKey: ['event-attendee-count', eventId],
    queryFn: () => attendeeService.getAttendeeCountByEvent(eventId),
    enabled: !!eventId,
  });
};
