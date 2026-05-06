export interface BlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface BlogContent {
  time: number;
  blocks: Record<string, unknown>[];
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogDto {
  title: string;
  excerpt?: string;
  content: BlogContent;
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
