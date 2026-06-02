'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAttendee, useUpdateAttendee } from '@/modules/attendees/hooks/useAttendees';
import { useEvents } from '@/modules/events/hooks/useEvents';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { AttendeeStatus } from '@/modules/attendees/types/attendee.types';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { ArrowLeft, Save, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  organization: z.string().optional(),
  status: z.nativeEnum(AttendeeStatus).optional(),
  websiteId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditAttendeePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: attendee, isLoading: isAttendeeLoading } = useAttendee(id);
  const { events = [] } = useEvents();
  const { websites = [] } = useWebsites();
  const updateMutation = useUpdateAttendee();

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
      phoneNumber: '',
      organization: '',
      status: AttendeeStatus.REGISTERED,
      websiteId: '',
    },
  });

  useEffect(() => {
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
        phoneNumber: attendee.phoneNumber || '',
        organization: attendee.organization || '',
        status: attendee.status || AttendeeStatus.REGISTERED,
        websiteId: webId || '',
      });
    }
  }, [attendee, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          status: values.status,
          organization: values.organization || '',
          eventId: values.eventId,
          websiteId: values.websiteId || undefined,
        },
      });
      toast.success('Attendee registration updated successfully');
      router.push('/attendance');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update attendee');
    }
  };

  if (isAttendeeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
          <p className="text-sm text-gray-500 font-medium">Loading attendee details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/attendance')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-theme-xs"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Modify Registration</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Modify registration assignments and status controls.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs space-y-6">
        <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex items-start gap-2.5 font-medium leading-relaxed">
          <Lock size={15} className="shrink-0 mt-0.5" />
          <span>
            To ensure ticket authenticity, profile information (Name, Email, and Phone) are
            read-only. Only event assignment, organization, and status can be modified.
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Event Selection */}
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
            {errors.eventId?.message && (
              <p className="mt-1.5 text-xs text-red-500">{errors.eventId.message}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="name"
                    disabled={true}
                    error={errors.name?.message}
                    className="mt-1"
                  />
                  <Lock
                    size={14}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              )}
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    disabled={true}
                    error={errors.email?.message}
                    className="mt-1"
                  />
                  <Lock
                    size={14}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              )}
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id="phoneNumber"
                    disabled={true}
                    error={errors.phoneNumber?.message}
                    className="mt-1"
                  />
                  <Lock
                    size={14}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
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

          {/* Status */}
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

          <div className="pt-4 border-t border-gray-150 dark:border-navy-700 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/attendance')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
