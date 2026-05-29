import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendeeService } from '@/services/attendee.service';
import {
  AttendeeQueryParams,
  CreateAttendeeInput,
  UpdateAttendeeInput,
} from '../types/attendee.types';

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

export const useAttendees = (params?: AttendeeQueryParams) => {
  return useQuery({
    queryKey: ['attendees', params],
    queryFn: () => attendeeService.getAttendees(params),
  });
};

export const useAttendee = (id: string) => {
  return useQuery({
    queryKey: ['attendee', id],
    queryFn: () => attendeeService.getAttendeeById(id),
    enabled: !!id,
  });
};

export const useCreateAttendee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttendeeInput) => attendeeService.createAttendee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees'] });
      queryClient.invalidateQueries({ queryKey: ['event-attendee-count'] });
    },
  });
};

export const useUpdateAttendee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendeeInput }) =>
      attendeeService.updateAttendee(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
      queryClient.invalidateQueries({ queryKey: ['attendee', data.id] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees'] });
    },
  });
};

export const useDeleteAttendee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendeeService.deleteAttendee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees'] });
      queryClient.invalidateQueries({ queryKey: ['event-attendee-count'] });
    },
  });
};

export const useCheckInAttendee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (passCode: string) => attendeeService.checkInAttendee(passCode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
      queryClient.invalidateQueries({ queryKey: ['attendee', data.id] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees'] });
    },
  });
};
