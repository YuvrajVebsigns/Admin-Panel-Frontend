'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Globe,
  Clock,
  Plus,
  Trash2,
  Info,
  Search,
  Image as ImageIcon,
  CheckCircle,
  Link as LinkIcon,
  Users,
  Building2,
  User,
  Award,
} from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Switch from '@/components/form/switch/Switch';
import DateTimePicker from '@/components/form/date-picker';
import TagInput from '@/components/form/input/TagInput';
import { UniversalImagePicker } from '@/components/form/UniversalImagePicker';
import dynamicImport from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const Editor = dynamicImport(() => import('@/components/ui/editor/Editor'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center border border-gray-100 dark:border-navy-700 rounded-2xl bg-white dark:bg-navy-900">
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <span className="text-xs font-semibold">Loading editor...</span>
      </div>
    </div>
  ),
});
import { ImageLinks } from '@/modules/websites/types/website.types';
import {
  EventManagement,
  EventType,
  EventStatus,
  CreateEventInput,
  UpdateEventInput,
} from '../types/event.types';
import { useEvents } from '../hooks/useEvents';
import { useSponsors } from '@/modules/sponsors/hooks/useSponsors';
import { SponsorType } from '@/modules/sponsors/types/sponsor.types';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { BlogContent } from '@/modules/blogs/types/blog.types';

const getFileId = (file: unknown): string => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  if (typeof file === 'object' && file !== null) {
    const record = file as Record<string, unknown>;
    return (record.id as string) || (record._id as string) || '';
  }
  return '';
};

const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  excerpt: z.string().optional(),
  type: z.nativeEnum(EventType),
  status: z.nativeEnum(EventStatus),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  websites: z.array(z.string()).min(1, 'Select at least one website'),
  meetingLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z
    .object({
      address: z.string().optional(),
      city: z.string().optional(),
      mapLink: z.string().url('Invalid URL').optional().or(z.literal('')),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
  bannerImage: z.string().optional().or(z.literal('')),
  bannerImageId: z.string().optional(),
  agenda: z
    .array(
      z.object({
        time: z.string().min(1, 'Time is required'),
        title: z.string().min(1, 'Title is required'),
        speaker: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .default([]),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).default([]),
      ogImage: z.string().optional().or(z.literal('')),
      ogImageId: z.string().optional(),
    })
    .optional(),
  invitedEmails: z.array(z.string().email('Invalid email address')).default([]),
  sponsors: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: EventManagement | null;
  defaultWebsiteId?: string | null;
}

const STEPS = [
  { id: 'basics', title: 'Basics', icon: Info },
  { id: 'schedule', title: 'Schedule & Content', icon: Calendar },
  { id: 'venue', title: 'Venue & Links', icon: MapPin },
  { id: 'agenda', title: 'Agenda', icon: Clock },
  { id: 'invites', title: 'Invites & Sponsors', icon: Users },
  { id: 'seo', title: 'SEO & Media', icon: Search },
];

export const EventForm: React.FC<EventFormProps> = ({ initialData, defaultWebsiteId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams ? searchParams.get('from') || '/events' : '/events';
  const backLabel = redirectUrl.includes('dashboard') ? 'Back to Dashboard' : 'Back to Events';
  const websiteIdParam = defaultWebsiteId || searchParams.get('websiteId');
  const isEdit = !!initialData;
  const { createEvent, updateEvent, isCreating, isUpdating } = useEvents();
  const { websites } = useWebsites({ limit: 100 });
  const { sponsors: allSponsors } = useSponsors({ limit: 1000 });
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [content, setContent] = useState<BlogContent | null>(initialData?.description || null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<EventFormData>({
    // @ts-ignore
    resolver: zodResolver(eventSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          startDate: new Date(initialData.startDate).toISOString().slice(0, 16).replace('T', ' '),
          endDate: new Date(initialData.endDate).toISOString().slice(0, 16).replace('T', ' '),
          websites: initialData.websites.map((w) =>
            typeof w === 'string' ? w : (w as { id: string }).id,
          ),
          bannerImage: getImageUrl(initialData.bannerImage) || '',
          bannerImageId: getFileId(initialData.bannerImageId),
          seo: {
            ...initialData.seo,
            ogImage: getImageUrl(initialData.seo?.ogImage) || '',
            ogImageId: getFileId(initialData.seo?.ogImageId),
            keywords: initialData.seo?.keywords || [],
          },
          invitedEmails: initialData.invitedEmails || [],
          sponsors: initialData.sponsors
            ? initialData.sponsors
                .map((s) => {
                  if (typeof s === 'string') return s;
                  if (s && typeof s === 'object') {
                    return (
                      (s as { id?: string; _id?: string }).id ||
                      (s as { id?: string; _id?: string })._id ||
                      ''
                    );
                  }
                  return '';
                })
                .filter(Boolean)
            : [],
          agenda: initialData.agenda
            ? initialData.agenda.map((item) => {
                let formattedTime = item.time;
                if (item.time && !item.time.includes('-') && !item.time.includes('/')) {
                  const datePart = initialData.startDate
                    ? initialData.startDate.split('T')[0]
                    : new Date().toISOString().split('T')[0];
                  formattedTime = `${datePart} ${item.time}`;
                }
                return {
                  ...item,
                  time: formattedTime,
                };
              })
            : [],
        }
      : {
          title: '',
          slug: '',
          excerpt: '',
          type: EventType.OFFLINE,
          status: EventStatus.DRAFT,
          startDate: '',
          endDate: '',
          websites: websiteIdParam ? [websiteIdParam] : [],
          bannerImage: '',
          bannerImageId: '',
          isActive: true,
          agenda: [],
          invitedEmails: [],
          sponsors: [],
          seo: {
            ogImage: '',
            ogImageId: '',
            keywords: [],
          },
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'agenda',
  });

  const eventType = watch('type');
  const watchedTitle = watch('title');

  // Auto-generate slug
  useEffect(() => {
    if (!isEdit && watchedTitle) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [watchedTitle, isEdit, setValue]);

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate as unknown as Parameters<typeof trigger>[0]);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ['title', 'slug', 'type', 'status', 'websites'];
      case 1:
        return ['startDate', 'endDate'];
      case 2:
        return eventType === EventType.ONLINE
          ? ['meetingLink']
          : ['location.address', 'location.city'];
      case 3:
        return ['agenda'];
      case 4:
        return ['invitedEmails', 'sponsors'];
      case 5:
        return ['seo.metaTitle', 'seo.metaDescription'];
      default:
        return [];
    }
  };

  const parseFlatpickrDate = (str: string) => {
    if (!str) return null;
    if (str.includes('T') && str.endsWith('Z')) {
      return new Date(str);
    }
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})\s+(AM|PM)$/i);
    if (match && match[1] && match[2] && match[3] && match[4] && match[5] && match[6]) {
      const y = match[1];
      const m = match[2];
      const d = match[3];
      const hrStr = match[4];
      const minStr = match[5];
      const ampm = match[6];
      let hr = parseInt(hrStr, 10);
      const min = parseInt(minStr, 10);
      if (ampm.toUpperCase() === 'PM' && hr < 12) {
        hr += 12;
      } else if (ampm.toUpperCase() === 'AM' && hr === 12) {
        hr = 0;
      }
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), hr, min);
    }
    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  const onSubmit = async (data: EventFormData) => {
    if (!content) {
      setCurrentStep(1);
      return;
    }

    try {
      const parsedStartDate = parseFlatpickrDate(data.startDate);
      const parsedEndDate = parseFlatpickrDate(data.endDate);

      const payload = {
        ...data,
        startDate: parsedStartDate ? parsedStartDate.toISOString() : data.startDate,
        endDate: parsedEndDate ? parsedEndDate.toISOString() : data.endDate,
        bannerImageId: data.bannerImageId || undefined,
        bannerImage: data.bannerImage ? { original: data.bannerImage } : undefined,
        agenda: data.agenda
          ? data.agenda.map((item) => {
              const parsedTime = parseFlatpickrDate(item.time);
              return {
                ...item,
                time: parsedTime ? parsedTime.toISOString() : item.time,
              };
            })
          : [],
        seo: data.seo
          ? {
              metaTitle: data.seo.metaTitle || undefined,
              metaDescription: data.seo.metaDescription || undefined,
              keywords: data.seo.keywords || [],
              ogImageId: data.seo.ogImageId || undefined,
              ogImage: data.seo.ogImage ? { original: data.seo.ogImage } : undefined,
            }
          : undefined,
        description: content,
      };

      if (payload.location) {
        if (!payload.location.address) delete payload.location.address;
        if (!payload.location.city) delete payload.location.city;
        if (!payload.location.mapLink) {
          delete payload.location.mapLink;
        }
      }

      if (isEdit && initialData) {
        await updateEvent({ id: initialData.id, data: payload as unknown as UpdateEventInput });
      } else {
        await createEvent(payload as unknown as CreateEventInput);
      }
      router.push(redirectUrl);
    } catch (error) {
      // Handled by hook
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g. Annual Tech Conference 2024"
                  error={errors.title?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="tech-conf-2024"
                  error={errors.slug?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Short Excerpt</Label>
              <TextArea
                id="excerpt"
                {...register('excerpt')}
                placeholder="Brief summary for listing cards..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={[
                        { label: 'Online (Virtual)', value: EventType.ONLINE },
                        { label: 'Offline (In-Person)', value: EventType.OFFLINE },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Event Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={Object.values(EventStatus).map((s) => ({
                        label: s.replace('_', ' '),
                        value: s,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Target Platforms (Websites)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {websites.map((site) => (
                  <label
                    key={site.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer',
                      watch('websites').includes(site.id)
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10'
                        : 'border-gray-100 dark:border-navy-700 hover:border-brand-200',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={watch('websites').includes(site.id)}
                      onChange={(e) => {
                        const current = watch('websites');
                        if (e.target.checked) {
                          setValue('websites', [...current, site.id], { shouldValidate: true });
                        } else {
                          setValue(
                            'websites',
                            current.filter((id) => id !== site.id),
                            { shouldValidate: true },
                          );
                        }
                      }}
                    />
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-100 p-1">
                      {getImageUrl(site.logo) ? (
                        <img
                          src={getImageUrl(site.logo)}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-brand-500">
                          {site.name[0]}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold truncate">{site.name}</span>
                  </label>
                ))}
              </div>
              {errors.websites && (
                <p className="text-xs text-error-500 mt-1">{errors.websites.message}</p>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    id="startDate"
                    label="Start Date & Time"
                    showTime
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    error={errors.startDate?.message}
                  />
                )}
              />
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    id="endDate"
                    label="End Date & Time"
                    showTime
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    error={errors.endDate?.message}
                    minDate={watch('startDate')}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Editor
                // @ts-ignore
                data={content as unknown as { blocks: unknown[] }}
                onChange={(data) => setContent(data as unknown as BlogContent)}
                placeholder="Provide detailed information about the event..."
              />
              {!content && (
                <p className="text-xs text-warning-500">Content is required before publishing.</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {eventType === EventType.ONLINE ? (
              <div className="space-y-4">
                <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
                  <Globe className="text-blue-600" size={24} />
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-100">
                      Virtual Event Settings
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Please provide the meeting link (Zoom, Google Meet, etc.)
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    {...register('meetingLink')}
                    placeholder="https://zoom.us/j/..."
                    error={errors.meetingLink?.message}
                    startIcon={<LinkIcon size={18} />}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-center gap-4">
                  <MapPin className="text-orange-600" size={24} />
                  <div>
                    <h4 className="font-bold text-orange-900 dark:text-orange-100">
                      Physical Venue Settings
                    </h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      Specify where the event will take place
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location.city">City</Label>
                    <Input
                      id="location.city"
                      {...register('location.city')}
                      placeholder="e.g. New York, London"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location.address">Full Address</Label>
                    <Input
                      id="location.address"
                      {...register('location.address')}
                      placeholder="123 Conference Ave, Building B"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.mapLink">Google Maps Link</Label>
                  <Input
                    id="location.mapLink"
                    {...register('location.mapLink')}
                    placeholder="https://maps.google.com/..."
                    error={errors.location?.mapLink?.message}
                    startIcon={<MapPin size={18} />}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Event Agenda</h4>
                <p className="text-xs text-gray-500">Add segments for your event schedule</p>
              </div>
              <Button
                size="sm"
                onClick={() => append({ time: '', title: '', speaker: '', description: '' })}
              >
                <Plus size={16} className="mr-2" /> Add Segment
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-6 bg-gray-50 dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-700 relative group"
                >
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-error-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-3">
                      <Controller
                        name={`agenda.${index}.time`}
                        control={control}
                        render={({ field }) => (
                          <DateTimePicker
                            id={`agenda.${index}.time`}
                            label="Time"
                            showTime
                            value={field.value}
                            onChange={(date) => field.onChange(date)}
                            error={errors.agenda?.[index]?.time?.message}
                            placeholder="Select date & time..."
                          />
                        )}
                      />
                    </div>
                    <div className="md:col-span-9 space-y-2">
                      <Label>Segment Title</Label>
                      <Input
                        {...register(`agenda.${index}.title`)}
                        placeholder="Keynote Speech: Future of AI"
                        error={errors.agenda?.[index]?.title?.message}
                      />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <Label>Speaker (Optional)</Label>
                      <Input {...register(`agenda.${index}.speaker`)} placeholder="John Doe" />
                    </div>
                    <div className="md:col-span-8 space-y-2">
                      <Label>Description (Optional)</Label>
                      <TextArea
                        {...register(`agenda.${index}.description`)}
                        placeholder="Quick brief about this segment..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-gray-100 dark:border-navy-800 rounded-3xl">
                  <Clock className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500">No agenda segments added yet.</p>
                  <button
                    type="button"
                    onClick={() => append({ time: '', title: '', speaker: '', description: '' })}
                    className="mt-4 text-brand-500 font-bold hover:underline"
                  >
                    Add your first segment
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        const selectedSponsorIds = watch('sponsors') || [];

        const sortedSponsors = [...(allSponsors || [])]
          .filter((s) => {
            const term = sponsorSearch.toLowerCase();
            return (
              s.name.toLowerCase().includes(term) ||
              s.companyName?.toLowerCase().includes(term) ||
              s.tier?.toLowerCase().includes(term)
            );
          })
          .sort((a, b) => {
            const aSelected = selectedSponsorIds.includes(a.id);
            const bSelected = selectedSponsorIds.includes(b.id);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
          });

        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Invites */}
              <div className="space-y-6">
                <div className="p-6 bg-brand-50 dark:bg-brand-500/10 rounded-3xl border border-brand-100 dark:border-brand-900/30 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-navy-900 flex items-center justify-center text-brand-500 shadow-sm shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      Invite Attendees
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Manage your event invitation list. Add emails of people you want to invite.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-6 shadow-sm space-y-4">
                  <Label>Invitation List (Emails)</Label>
                  <Controller
                    name="invitedEmails"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        defaultValue={field.value}
                        onChange={field.onChange}
                        placeholder="Type email and press Enter..."
                        error={!!errors.invitedEmails?.message}
                      />
                    )}
                  />
                  <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
                    <Info size={12} className="shrink-0" />
                    Invited people will receive an automated email notification with event details.
                  </p>
                </div>
              </div>

              {/* Right Column: Sponsors Alignment */}
              <div className="space-y-6">
                <div className="p-6 bg-purple-50 dark:bg-purple-500/10 rounded-3xl border border-purple-100 dark:border-purple-900/30 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-navy-900 flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      Event Sponsors & Partners
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Align active sponsors to this event to display them on the event detail pages.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-6 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sponsor-search">Search Sponsors</Label>
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        id="sponsor-search"
                        type="text"
                        placeholder="Search by name, company, or tier..."
                        value={sponsorSearch}
                        onChange={(e) => setSponsorSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* List of active/selected sponsors */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {sortedSponsors.map((sponsor) => {
                      const isSelected = selectedSponsorIds.includes(sponsor.id);
                      let logoUrl = '';
                      if (typeof sponsor.logo === 'string') {
                        logoUrl = sponsor.logo;
                      } else if (sponsor.logo && typeof sponsor.logo === 'object') {
                        logoUrl =
                          (sponsor.logo as ImageLinks).thumbnail ||
                          (sponsor.logo as ImageLinks).original ||
                          '';
                      }

                      return (
                        <div
                          key={sponsor.id}
                          onClick={() => {
                            const newSelected = isSelected
                              ? selectedSponsorIds.filter((id) => id !== sponsor.id)
                              : [...selectedSponsorIds, sponsor.id];
                            setValue('sponsors', newSelected, { shouldValidate: true });
                          }}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none',
                            isSelected
                              ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-500/10'
                              : 'border-gray-50 dark:border-navy-900 hover:border-gray-200 dark:hover:border-navy-700',
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-navy-850 bg-gray-50 dark:bg-navy-950 flex items-center justify-center">
                              {logoUrl ? (
                                <img
                                  src={logoUrl}
                                  alt=""
                                  className="object-cover w-full h-full animate-fade-in"
                                />
                              ) : (
                                <div className="text-gray-400">
                                  {sponsor.type === SponsorType.INDIVIDUAL ? (
                                    <User size={16} />
                                  ) : (
                                    <Building2 size={16} />
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
                                {sponsor.name}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate">
                                {sponsor.companyName || 'Individual Sponsor'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {sponsor.tier && (
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gray-100 dark:bg-navy-750 text-gray-500 dark:text-navy-300">
                                {sponsor.tier}
                              </span>
                            )}
                            <div
                              className={cn(
                                'w-5 h-5 rounded-md border flex items-center justify-center transition-all',
                                isSelected
                                  ? 'border-brand-500 bg-brand-500 text-white'
                                  : 'border-gray-200 dark:border-navy-700',
                              )}
                            >
                              {isSelected && <CheckCircle size={12} className="text-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {sortedSponsors.length === 0 && (
                      <p className="text-xs text-center text-gray-400 py-6 italic">
                        No active sponsors found matching query.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <ImageIcon size={20} className="text-brand-500" />
                    Media Assets
                  </h3>
                  <div className="space-y-4">
                    <Controller
                      name="bannerImage"
                      control={control}
                      render={({ field }) => (
                        <UniversalImagePicker
                          label="Main Banner Image"
                          value={field.value}
                          onChange={field.onChange}
                          onSelect={(file) => setValue('bannerImageId', file?.id || '')}
                          aspectRatio="video"
                          module="events"
                          placeholder="Select event banner..."
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Search size={20} className="text-brand-500" />
                    SEO Optimization
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="seo.metaTitle">Meta Title</Label>
                      <Input
                        id="seo.metaTitle"
                        {...register('seo.metaTitle')}
                        placeholder="Google Search Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seo.metaDescription">Meta Description</Label>
                      <TextArea
                        id="seo.metaDescription"
                        {...register('seo.metaDescription')}
                        placeholder="Brief summary for search results..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <Controller
                        name="seo.keywords"
                        control={control}
                        render={({ field }) => (
                          <TagInput
                            defaultValue={field.value}
                            onChange={field.onChange}
                            placeholder="Add keywords..."
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <CheckCircle size={20} className="text-brand-500" />
                    Visibility
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-700">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Active Status
                      </p>
                      <p className="text-[10px] text-gray-500">Hidden if disabled</p>
                    </div>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onChange={field.onChange} />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(redirectUrl)}
            className="p-2.5 rounded-xl bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 text-gray-500 hover:text-brand-500 transition-all shadow-theme-xs hover:shadow-theme-sm"
            title={backLabel}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Event' : 'Create Event'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEdit ? 'Modify existing event details' : 'Setup a new event experience'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(redirectUrl)}
            className="bg-white dark:bg-navy-800"
          >
            Cancel
          </Button>
          {currentStep === STEPS.length - 1 && (
            <Button
              // @ts-ignore
              onClick={handleSubmit(onSubmit)}
              disabled={isCreating || isUpdating}
              className="px-8 shadow-lg shadow-brand-500/20"
            >
              <Save size={18} className="mr-2" />
              {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update Event' : 'Publish Event'}
            </Button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-navy-800 -translate-y-1/2 -z-10 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;

          return (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => index < currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg',
                  isActive
                    ? 'bg-brand-500 text-white scale-110 shadow-brand-500/30'
                    : isCompleted
                      ? 'bg-success-500 text-white shadow-success-500/30'
                      : 'bg-white dark:bg-navy-800 text-gray-400 border border-gray-100 dark:border-navy-700',
                )}
              >
                {isCompleted ? <CheckCircle size={24} /> : <Icon size={24} />}
              </button>
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-widest hidden sm:block',
                  isActive ? 'text-brand-500' : isCompleted ? 'text-success-500' : 'text-gray-400',
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-navy-800/50 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-theme-sm min-h-[400px]">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center text-sm">
              {currentStep + 1}
            </span>
            {STEPS[currentStep]?.title}
          </h2>
          <div className="h-1 w-20 bg-brand-500 rounded-full mt-2" />
        </div>

        {renderStep()}

        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-50 dark:border-navy-800">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="group"
          >
            <ChevronLeft
              size={18}
              className="mr-2 transition-transform group-hover:-translate-x-1"
            />
            Previous Step
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="group">
              Continue to {STEPS[currentStep + 1]?.title}
              <ChevronRight
                size={18}
                className="ml-2 transition-transform group-hover:translate-x-1"
              />
            </Button>
          ) : (
            <Button
              // @ts-ignore
              onClick={handleSubmit(onSubmit)}
              disabled={isCreating || isUpdating}
              className="px-10 shadow-lg shadow-brand-500/20"
            >
              <Save size={18} className="mr-2" />
              {isCreating || isUpdating
                ? 'Saving...'
                : isEdit
                  ? 'Update & Exit'
                  : 'Finish & Publish'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
