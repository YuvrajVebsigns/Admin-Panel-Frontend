import { ImageLinks } from './website.types';

export enum PageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum PageType {
  STATIC_PAGE = 'STATIC_PAGE',
  BLOG_PAGE = 'BLOG_PAGE',
  LANDING_PAGE = 'LANDING_PAGE',
  CUSTOM_PAGE = 'CUSTOM_PAGE',
}

export enum NavbarPosition {
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
}

export enum MenuType {
  INTERNAL_PAGE = 'INTERNAL_PAGE',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  CATEGORY = 'CATEGORY',
}

export interface SeoMeta {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageId?: string;
  ogImage?: string | ImageLinks;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageId?: string;
  twitterImage?: string | ImageLinks;
  schemaMarkup?: string;
  noIndex: boolean;
  noFollow: boolean;
}

export interface IPageSection {
  type: string;
  order: number;
  data: Record<string, unknown>;
}

export interface WebsitePage {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  shortDescription?: string;
  content: unknown; // Raw JSON from EditorJS
  pageType: PageType;
  status: PageStatus;
  featuredImageId?: string;
  sections?: IPageSection[];
  navbarId?: string;
  isHomepage: boolean;
  publishedAt?: string;
  seo: SeoMeta;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavbarItem {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  position: NavbarPosition;
  menuType: MenuType;
  target?: '_self' | '_blank';
  parentId?: string | null;
  order: number;
  isVisible: boolean;
  pageId?: string | null;
  children?: NavbarItem[];
}
