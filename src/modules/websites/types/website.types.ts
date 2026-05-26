export interface ImageLinks {
  original: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
}

export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string | ImageLinks;
}

export interface Website {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logo?: string | ImageLinks;
  description?: string;
  isActive: boolean;
  settings: Record<string, unknown>;
  seo: SeoMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
}
