export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
}

export interface Website {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logo?: string;
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
