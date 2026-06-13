import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/event.service';
import {
  CreateEventInput,
  UpdateEventInput,
  EventStatus,
  CreateEventMeetingInput,
  UpdateEventMeetingInput,
} from '../types/event.types';
import toast from 'react-hot-toast';

export const useEvents = (filters: { websiteId?: string; status?: EventStatus } = {}) => {
  const queryClient = useQueryClient();

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventService.getEvents(filters),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEventInput) => eventService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create event');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventInput }) =>
      eventService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update event');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });

  return {
    events: events || [],
    isLoading,
    error,
    createEvent: createMutation.mutateAsync,
    updateEvent: updateMutation.mutateAsync,
    deleteEvent: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id),
    enabled: !!id,
  });
};

export const useEventMeetings = (eventId: string) => {
  return useQuery({
    queryKey: ['event-meetings', eventId],
    queryFn: () => eventService.getEventMeetings(eventId),
    enabled: !!eventId,
  });
};

export const useCreateEventMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: CreateEventMeetingInput }) =>
      eventService.createEventMeeting(eventId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-meetings', variables.eventId] });
      toast.success('Meeting booked successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to book meeting');
    },
  });
};

export const useUpdateEventMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      meetingId,
      data,
    }: {
      eventId: string;
      meetingId: string;
      data: UpdateEventMeetingInput;
    }) => eventService.updateEventMeeting(eventId, meetingId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-meetings', variables.eventId] });
      toast.success('Meeting updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update meeting');
    },
  });
};

export const useDeleteEventMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, meetingId }: { eventId: string; meetingId: string }) =>
      eventService.deleteEventMeeting(eventId, meetingId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-meetings', variables.eventId] });
      toast.success('Meeting reservation deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete meeting reservation');
    },
  });
};
