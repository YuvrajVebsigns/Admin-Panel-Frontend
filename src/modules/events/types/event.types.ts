import { BlogContent } from '@/modules/blogs/types/blog.types';
import { ImageLinks } from '@/modules/websites/types/website.types';

export enum EventType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_GOING = 'ON_GOING',
  SCHEDULED = 'SCHEDULED',
  IN_REVIEW = 'IN_REVIEW',
}

export interface EventLocation {
  address: string;
  city: string;
  mapLink: string;
  lat: number;
  lng: number;
}

export interface AgendaItem {
  time: string;
  title: string;
  speaker: string;
  description: string;
}

export interface EventSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage: string | ImageLinks;
  ogImageId: string;
}

export enum ScheduleType {
  BEFORE_EVENT = 'BEFORE_EVENT',
  AFTER_EVENT = 'AFTER_EVENT',
  EXACT_DATE = 'EXACT_DATE',
}

export interface EventScheduledEmail {
  templateId: string | Record<string, unknown>;
  scheduleType: ScheduleType;
  daysOffset?: number;
  hoursOffset?: number;
  minutesOffset?: number;
  exactDate?: string;
  isActive: boolean;
  isProcessed: boolean;
}

export interface EventManagement {
  id: string;
  title: string;
  slug: string;
  description: BlogContent;
  excerpt: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location?: EventLocation;
  meetingLink?: string;
  bannerImage?: ImageLinks;
  bannerImageId?: string;
  websites: string[] | unknown[];
  sponsors: string[] | unknown[];
  agenda: AgendaItem[];
  seo: EventSeo;
  isActive: boolean;
  totalRegistrations?: number;
  invitedEmails?: string[];
  scheduledEmails?: EventScheduledEmail[];
  createdAt: string;
  updatedAt: string;
}

export type CreateEventInput = Omit<EventManagement, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>;
export type UpdateEventInput = Partial<CreateEventInput>;

import { Attendee } from '@/modules/attendees/types/attendee.types';
import { Sponsor } from '@/modules/sponsors/types/sponsor.types';

export interface EventMeeting {
  id: string;
  eventId: string;
  agendaIndex: number;
  agendaTime: string;
  agendaTitle: string;
  attendeeIds: string[] | Attendee[];
  sponsorId: string | Sponsor;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventMeetingInput {
  eventId: string;
  agendaIndex: number;
  agendaTime: string;
  agendaTitle: string;
  attendeeIds: string[];
  sponsorId: string;
  notes?: string;
}

export type UpdateEventMeetingInput = Partial<CreateEventMeetingInput>;
