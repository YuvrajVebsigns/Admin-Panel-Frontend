'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateAttendee } from '@/modules/attendees/hooks/useAttendees';
import { useEvents } from '@/modules/events/hooks/useEvents';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { AttendeeStatus } from '@/modules/attendees/types/attendee.types';
import { registreeService } from '@/services/registree.service';
import { Registree } from '@/modules/attendees/types/registree.types';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import {
  ArrowLeft,
  Save,
  Search,
  ArrowRight,
  UserCheck,
  UserPlus,
  Calendar,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
  organization: z.string().optional(),
  status: z.nativeEnum(AttendeeStatus).optional(),
  websiteId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateAttendeePage() {
  const router = useRouter();
  const { events = [] } = useEvents();
  const { websites = [] } = useWebsites();
  const createMutation = useCreateAttendee();

  // Wizard state
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [isSearching, setIsSearching] = React.useState<boolean>(false);

  const [matchedRegistree, setMatchedRegistree] = React.useState<Registree | null>(null);

  // Filter events to exclude: DRAFT, COMPLETED, CANCELLED, or Expired (endDate < now)
  const activeEvents = React.useMemo(() => {
    return events.filter((e) => {
      const isDraft = e.status === 'DRAFT';
      const isCompleted = e.status === 'COMPLETED';
      const isCancelled = e.status === 'CANCELLED';
      const isExpired = e.endDate ? new Date(e.endDate) < new Date() : false;
      return !isDraft && !isCompleted && !isCancelled && !isExpired;
    });
  }, [events]);

  const eventOptions = activeEvents.map((e) => ({
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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventId: '',
      email: '',
      name: '',
      phoneNumber: '',
      organization: '',
      status: AttendeeStatus.REGISTERED,
      websiteId: '',
    },
  });

  const selectedEventId = watch('eventId');
  const enteredEmail = watch('email');
  const selectedEvent = React.useMemo(() => {
    return activeEvents.find((e) => e.id === selectedEventId);
  }, [selectedEventId, activeEvents]);

  const handleSearchEmail = async () => {
    if (!enteredEmail || !/^\S+@\S+\.\S+$/.test(enteredEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSearching(true);
    try {
      const response = await registreeService.getRegistrees({ search: enteredEmail });
      // Find exact match or first result
      const matched =
        response.data.find((r) => r.email.toLowerCase() === enteredEmail.toLowerCase()) || null;

      if (matched) {
        setMatchedRegistree(matched);
        setValue('name', matched.name);
        setValue('phoneNumber', matched.phoneNumber || '');
        setValue('organization', matched.organization || '');
        if (matched.websiteId) {
          setValue(
            'websiteId',
            typeof matched.websiteId === 'object' ? matched.websiteId.id : matched.websiteId,
          );
        }
        toast.success(`Registrant found: ${matched.name}`);
      } else {
        setMatchedRegistree(null);
        // Clear old pre-fills so user registers fresh
        setValue('name', '');
        setValue('phoneNumber', '');
        setValue('organization', '');
        setValue('websiteId', '');
        toast('No matching registrant found. Please enter details for a new attendee.');
      }
      setCurrentStep(3);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to search registree database');
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        eventId: values.eventId,
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber || undefined,
        organization: values.organization || undefined,
        status: values.status,
        websiteId: values.websiteId || undefined,
      });
      toast.success('Attendee registered successfully');
      router.push('/attendance');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Something went wrong');
    }
  };

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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Register New Attendee</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Create a registered user mapped to upcoming or ongoing events.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-5 shadow-theme-xs">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: 'Select Event' },
            { step: 2, label: 'Verify Email' },
            { step: 3, label: 'Complete Registration' },
          ].map((item, index, arr) => (
            <React.Fragment key={item.step}>
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep === item.step
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 ring-4 ring-brand-500/10'
                      : currentStep > item.step
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-150 dark:bg-navy-900 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {currentStep > item.step ? '✓' : item.step}
                </div>
                <span
                  className={`text-xs font-bold transition-colors ${
                    currentStep === item.step
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {index < arr.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-4 rounded ${
                    currentStep > item.step ? 'bg-emerald-500' : 'bg-gray-150 dark:bg-navy-900'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Step 1: Select Event */}
          {currentStep === 1 && (
            <div className="space-y-5">
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
                      placeholder={
                        eventOptions.length === 0
                          ? 'No active events available'
                          : 'Select Upcoming/Ongoing Event'
                      }
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

              {selectedEvent && (
                <div className="bg-gray-50 dark:bg-navy-900/50 rounded-2xl p-4 border border-gray-100 dark:border-navy-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-gray-450 dark:text-gray-500">
                      Selected Event Detail
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-500">
                      {selectedEvent.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-800 dark:text-white">
                    {selectedEvent.title}
                  </div>
                  <div className="flex flex-col gap-1.5 pt-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>
                        Starts:{' '}
                        {new Date(selectedEvent.startDate).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-gray-400" />
                      <span>Type: {selectedEvent.type}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-150 dark:border-navy-700 flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push('/attendance')}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!selectedEventId}
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2"
                >
                  Continue
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Verify Email */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Enter attendee's email address"
                      error={errors.email?.message}
                      className="mt-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchEmail();
                        }
                      }}
                    />
                  )}
                />
              </div>

              <div className="pt-4 border-t border-gray-150 dark:border-navy-700 flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Event
                </Button>
                <Button
                  type="button"
                  onClick={handleSearchEmail}
                  disabled={isSearching}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  {isSearching ? (
                    'Searching...'
                  ) : (
                    <>
                      <Search size={16} />
                      Verify Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Complete Details */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {matchedRegistree ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 rounded-2xl p-4 flex gap-3">
                  <UserCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-450">
                      Existing Registrant Match
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 leading-relaxed">
                      We found a registrant under this email. Standard profile fields (Name, Phone,
                      Origin Website) are auto-mapped and locked to preserve CRM integrity.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/50 rounded-2xl p-4 flex gap-3">
                  <UserPlus className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-450">
                      New Registrant Profile
                    </h4>
                    <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
                      No registrant found for{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {enteredEmail}
                      </span>
                      . Enter their details below to create a new profile.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder="Enter full name"
                        error={errors.name?.message}
                        disabled={!!matchedRegistree}
                        className="mt-1"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="phoneNumber"
                        placeholder="e.g. +1 (555) 019-2834"
                        error={errors.phoneNumber?.message}
                        disabled={!!matchedRegistree}
                        className="mt-1"
                      />
                    )}
                  />
                </div>

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
                        disabled={!!matchedRegistree}
                        className="mt-1"
                      />
                    )}
                  />
                </div>

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
                        disabled={!!matchedRegistree}
                        className="mt-1"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-150 dark:border-navy-700 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  disabled={isSubmitting}
                >
                  Back to Email
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  <Save size={16} />
                  {isSubmitting
                    ? 'Registering...'
                    : matchedRegistree
                      ? 'Register Matched Attendee'
                      : 'Register New Attendee'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
