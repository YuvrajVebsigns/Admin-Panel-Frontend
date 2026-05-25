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
  createdAt: string;
  updatedAt: string;
}

export type CreateEventInput = Omit<EventManagement, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>;
export type UpdateEventInput = Partial<CreateEventInput>;
