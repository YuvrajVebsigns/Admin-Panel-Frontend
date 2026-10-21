'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateAttendee, useUpdateAttendee } from '../hooks/useAttendees';
import { useEvents } from '@/modules/events/hooks/useEvents';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { Attendee, AttendeeStatus } from '../types/attendee.types';
import { Registree } from '../types/registree.types';
import { registreeService } from '@/services/registree.service';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { X, Lock, Search, ArrowRight, UserCheck, UserPlus, Save } from 'lucide-react';
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
  const { events = [] } = useEvents();
  const { websites = [] } = useWebsites();

  // Wizard state for creation mode
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

  const createMutation = useCreateAttendee();
  const updateMutation = useUpdateAttendee();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  const selectedEventId = watch('eventId');
  const enteredEmail = watch('email');
  const selectedEvent = React.useMemo(() => {
    return activeEvents.find((e) => e.id === selectedEventId);
  }, [selectedEventId, activeEvents]);

  useEffect(() => {
    if (isOpen) {
      // Reset wizard
      setCurrentStep(1);
      setMatchedRegistree(null);
      setIsSearching(false);

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
      } else {
        reset({
          eventId: '',
          name: '',
          email: '',
          phoneNumber: '',
          organization: '',
          status: AttendeeStatus.REGISTERED,
          websiteId: '',
        });
      }
    }
  }, [isOpen, attendee, reset]);

  if (!isOpen) return null;

  const handleSearchEmail = async () => {
    if (!enteredEmail || !/^\S+@\S+\.\S+$/.test(enteredEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSearching(true);
    try {
      const response = await registreeService.getRegistrees({ search: enteredEmail });
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
        setValue('name', '');
        setValue('phoneNumber', '');
        setValue('organization', '');
        setValue('websiteId', '');
        toast('No matching registrant found. Enter new attendee details.');
      }
      setCurrentStep(3);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to search registrees');
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && attendee) {
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
          phoneNumber: values.phoneNumber || undefined,
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

        {/* Compact Step Indicator (Only in create mode) */}
        {!isEdit && (
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-navy-900/30 border-b border-gray-150 dark:border-navy-700 flex items-center justify-between">
            {[
              { step: 1, label: 'Select Event' },
              { step: 2, label: 'Verify Email' },
              { step: 3, label: 'Complete' },
            ].map((item, index, arr) => (
              <React.Fragment key={item.step}>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                      currentStep === item.step
                        ? 'bg-brand-600 text-white shadow-sm'
                        : currentStep > item.step
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-150 dark:bg-navy-900 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {currentStep > item.step ? '✓' : item.step}
                  </div>
                  <span
                    className={`text-[10px] font-bold transition-colors ${
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
                    className={`h-0.5 flex-1 mx-2 rounded ${
                      currentStep > item.step ? 'bg-emerald-500' : 'bg-gray-150 dark:bg-navy-900'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {isEdit ? (
            /* ================= EDIT MODE ================= */
            <div className="space-y-5">
              <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex items-start gap-2.5 font-medium leading-relaxed">
                <Lock size={15} className="shrink-0 mt-0.5" />
                <span>
                  To ensure ticket authenticity, profile details (Name, Email, and Phone) are
                  read-only. Only event assignment, organization, and status can be modified.
                </span>
              </div>

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
                <Label htmlFor="name">Full Name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Input {...field} id="name" disabled={true} className="mt-1 pr-9" />
                      <Lock
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                        className="mt-1 pr-9"
                      />
                      <Lock
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                      <Input {...field} id="phoneNumber" disabled={true} className="mt-1 pr-9" />
                      <Lock
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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

              {/* Website */}
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
            </div>
          ) : (
            /* ================= CREATE MODE (WIZARD) ================= */
            <div className="space-y-5">
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
                    <div className="bg-gray-50 dark:bg-navy-900/50 rounded-2xl p-4 border border-gray-100 dark:border-navy-700 space-y-1">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-gray-450 dark:text-gray-500">
                        Selected Event
                      </div>
                      <div className="text-sm font-bold text-gray-800 dark:text-white">
                        {selectedEvent.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Scheduled: {new Date(selectedEvent.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-150 dark:border-navy-700 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={!selectedEventId}
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-1.5"
                    >
                      Continue
                      <ArrowRight size={14} />
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
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSearchEmail}
                      disabled={isSearching}
                      className="flex items-center gap-1.5"
                    >
                      {isSearching ? (
                        'Searching...'
                      ) : (
                        <>
                          <Search size={14} />
                          Verify Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Details form */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  {matchedRegistree ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 rounded-2xl p-4 flex gap-3">
                      <UserCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-450">
                          Existing Registrant Found
                        </h4>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500">
                          Profile details matched. Fields are locked to avoid profile duplicates.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/50 rounded-2xl p-4 flex gap-3">
                      <UserPlus className="text-amber-500 shrink-0 mt-0.5" size={16} />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-450">
                          New Registrant
                        </h4>
                        <p className="text-[11px] text-amber-600 dark:text-amber-500">
                          Enter the details below to create a new registrant.
                        </p>
                      </div>
                    </div>
                  )}

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

                  <div className="pt-4 border-t border-gray-150 dark:border-navy-700 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5"
                    >
                      <Save size={14} />
                      {isSubmitting
                        ? 'Saving...'
                        : matchedRegistree
                          ? 'Register Matched'
                          : 'Register New'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {isEdit && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 flex justify-end gap-3 rounded-b-2xl">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5"
            >
              <Save size={14} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
