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

export interface VotingTableHeading {
  id: string;
  key: string;
  label: string;
  placeholder?: string;
  required: boolean;
  enabled: boolean;
  order: number;
}

export interface WebsiteSettings extends Record<string, unknown> {
  votingTableHeadings?: VotingTableHeading[];
  nominationTitle?: string;
  nominationSubtitle?: string;
  maxRecommendations?: number;
}

export interface Website {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logo?: string | ImageLinks;
  description?: string;
  isActive: boolean;
  nominationActive?: boolean;
  settings: WebsiteSettings;
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
