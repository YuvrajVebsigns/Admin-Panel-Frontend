'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateAttendee, useUpdateAttendee } from '../hooks/useAttendees';
import { useEvents } from '@/modules/events/hooks/useEvents';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { Attendee, AttendeeStatus } from '../types/attendee.types';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  status: z.nativeEnum(AttendeeStatus).optional(),
  websiteId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AttendeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee?: Attendee | null;
}

export const AttendeeFormModal: React.FC<AttendeeFormModalProps> = ({
  isOpen,
  onClose,
  attendee,
}) => {
  const isEdit = !!attendee;
  const { events } = useEvents();
  const { websites } = useWebsites();

  const eventOptions = events.map((e) => ({
    value: e.id,
    label: e.title,
  }));

  const statusOptions = Object.values(AttendeeStatus).map((status) => ({
    value: status,
    label: status.replace('_', ' '),
  }));

  const websiteOptions = websites.map((w) => ({
    value: w.id,
    label: `${w.name} (${w.domain})`,
  }));

  const createMutation = useCreateAttendee();
  const updateMutation = useUpdateAttendee();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventId: '',
      name: '',
      email: '',
      phone: '',
      organization: '',
      status: AttendeeStatus.REGISTERED,
      websiteId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (attendee) {
        const evId =
          typeof attendee.eventId === 'object' && attendee.eventId
            ? attendee.eventId.id
            : attendee.eventId;
        const webId =
          typeof attendee.websiteId === 'object' && attendee.websiteId
            ? attendee.websiteId.id
            : attendee.websiteId;

        reset({
          eventId: evId || '',
          name: attendee.name || '',
          email: attendee.email || '',
          phone: attendee.phone || '',
          organization: attendee.organization || '',
          status: attendee.status || AttendeeStatus.REGISTERED,
          websiteId: webId || '',
        });
      } else {
        reset({
          eventId: '',
          name: '',
          email: '',
          phone: '',
          organization: '',
          status: AttendeeStatus.REGISTERED,
          websiteId: '',
        });
      }
    }
  }, [isOpen, attendee, reset]);

  if (!isOpen) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && attendee) {
        // According to user comment: only status, organization, eventId, and websiteId can be updated
        await updateMutation.mutateAsync({
          id: attendee.id,
          data: {
            status: values.status,
            organization: values.organization || '',
            eventId: values.eventId,
            websiteId: values.websiteId || undefined,
          },
        });
        toast.success('Registration updated successfully');
      } else {
        await createMutation.mutateAsync({
          eventId: values.eventId,
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          organization: values.organization || undefined,
          status: values.status,
          websiteId: values.websiteId || undefined,
        });
        toast.success('Attendee registered successfully');
      }
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-lg h-full bg-white dark:bg-navy-800 shadow-2xl flex flex-col justify-between transition-transform duration-300 animate-slide-in">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-navy-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Modify Registration' : 'Register Attendee'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isEdit ? 'Update attendee details and status' : 'Add a new registrant to an event'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {isEdit && (
            <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex items-start gap-2.5 font-medium leading-relaxed">
              <Lock size={15} className="shrink-0 mt-0.5" />
              <span>
                To ensure ticket authenticity, profile information (Name, Email, and Phone) are
                read-only. Only event assignment, organization, and status can be modified.
              </span>
            </div>
          )}

          {/* Event selection */}
          <div>
            <Label htmlFor="eventId">
              Event Assignment <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="eventId"
              control={control}
              render={({ field }) => (
                <Select
                  options={eventOptions}
                  placeholder="Select Event"
                  value={field.value}
                  onChange={field.onChange}
                  className="mt-1"
                />
              )}
            />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="name"
                    disabled={isEdit}
                    placeholder="Enter attendee's full name"
                    error={errors.name?.message}
                    className="mt-1"
                  />
                  {isEdit && (
                    <Lock
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )}
                </div>
              )}
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    disabled={isEdit}
                    placeholder="Enter email address"
                    error={errors.email?.message}
                    className="mt-1"
                  />
                  {isEdit && (
                    <Lock
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )}
                </div>
              )}
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="phone"
                    disabled={isEdit}
                    placeholder="e.g. +1 (555) 019-2834"
                    error={errors.phone?.message}
                    className="mt-1"
                  />
                  {isEdit && (
                    <Lock
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )}
                </div>
              )}
            />
          </div>

          {/* Organization */}
          <div>
            <Label htmlFor="organization">Organization / Company</Label>
            <Controller
              name="organization"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="organization"
                  placeholder="e.g. Acme Corporation"
                  error={errors.organization?.message}
                  className="mt-1"
                />
              )}
            />
          </div>

          {/* Status Selection */}
          <div>
            <Label htmlFor="status">Registration Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  options={statusOptions}
                  placeholder="Select Status"
                  value={field.value}
                  onChange={field.onChange}
                  className="mt-1"
                />
              )}
            />
          </div>

          {/* Website Selection (Optional) */}
          <div>
            <Label htmlFor="websiteId">Origin Website</Label>
            <Controller
              name="websiteId"
              control={control}
              render={({ field }) => (
                <Select
                  options={websiteOptions}
                  placeholder="None (Backend Manual)"
                  value={field.value}
                  onChange={field.onChange}
                  className="mt-1"
                />
              )}
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Attendee'}
          </Button>
        </div>
      </div>
    </div>
  );
};
