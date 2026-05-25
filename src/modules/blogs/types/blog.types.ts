import { ImageLinks } from '@/modules/websites/types/website.types';

export interface BlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string | ImageLinks;
  ogImageId?: string;
  canonicalUrl?: string;
}

export interface BlogBlock {
  id?: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tunes?: any;
}

export interface BlogContent {
  time: number;
  blocks: BlogBlock[];
  version: string;
}

export enum BlogStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Publish',
  SCHEDULED = 'Schedule',
  ARCHIVED = 'Archive',
}

export enum AutoArchiveDuration {
  THREE_MONTHS = '3_months',
  SIX_MONTHS = '6_months',
  ONE_YEAR = '1_year',
  THREE_YEARS = '3_year',
}

export enum CommentStrategy {
  PUBLIC = 'Public',
  INVITE_ONLY = 'InviteOnly',
  DISABLED = 'Disabled',
}

export interface BlogComment {
  id: string;
  _id?: string;
  blogId: string | { id: string; title: string; createdAt: string };
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface BlogEngagement {
  likes: number;
  views: number;
  commentsCount: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: BlogContent;
  seo?: BlogSEO;
  websites: (Record<string, unknown> | string)[];
  author: Record<string, unknown>;
  featureImage?: string | ImageLinks;
  featureImageId?: string;
  tags?: string[];
  isActive: boolean;
  status: BlogStatus;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  autoArchiveAt?: string | null;
  autoArchiveDuration?: AutoArchiveDuration | null;
  commentStrategy: CommentStrategy;
  invitedEmails?: string[];
  isHyperlinked: boolean;
  hyperlinkWebsites: (Record<string, unknown> | string)[];
  engagement?: BlogEngagement;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogDto {
  title: string;
  slug: string;
  excerpt?: string;
  content: BlogContent;
  featureImage?: string | ImageLinks;
  featureImageId?: string;
  tags?: string[];
  seo?: BlogSEO;
  websites: string[];
  isActive?: boolean;
  status?: BlogStatus;
  scheduledAt?: string | null;
  autoArchiveDuration?: AutoArchiveDuration | null;
  commentStrategy?: CommentStrategy;
  invitedEmails?: string[];
  isHyperlinked?: boolean;
  hyperlinkWebsites?: string[];
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  status?: BlogStatus;
  websiteId?: string;
}
