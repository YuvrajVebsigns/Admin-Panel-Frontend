export interface BlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface BlogBlock {
  id?: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface BlogContent {
  time: number;
  blocks: BlogBlock[];
  version: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: BlogContent;
  seo?: BlogSEO;
  websites: (Record<string, unknown> | string)[]; // Array of Website objects or IDs
  author: Record<string, unknown>;
  featureImage?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogDto {
  title: string;
  slug: string;
  excerpt?: string;
  content: BlogContent;
  featureImage?: string;
  tags?: string[];
  seo?: BlogSEO;
  websites: string[];
  isActive?: boolean;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  websiteId?: string;
}
