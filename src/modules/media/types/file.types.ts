export enum FileStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum FileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export interface FileMetadata {
  width: number | null;
  height: number | null;
  alt: string;
  blurhash: string | null;
}

export interface VariantInfo {
  key: string;
  width: number | null;
  height: number | null;
  size: number;
}

export interface FileData {
  id: string;
  provider: string;
  bucket: string;
  key: string;
  variants: Record<string, VariantInfo>;
  module: string;
  entityType: string;
  entityId: string;
  originalName: string;
  filename: string;
  mimeType: string;
  extension: string;
  fileType: string;
  size: number;
  visibility: FileVisibility;
  uploadedBy: string;
  metadata: FileMetadata;
  status: FileStatus;
  keywords?: string[];
  createdAt: string;
  updatedAt: string;
  url?: string;
  urlVariants?: Record<string, string>;
}

export interface QueryFileParams {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  visibility?: FileVisibility;
  fileType?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
}

export interface FileResponse {
  files: FileData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UpdateFileData {
  module?: string;
  visibility?: FileVisibility;
  alt?: string;
  keywords?: string[];
}
