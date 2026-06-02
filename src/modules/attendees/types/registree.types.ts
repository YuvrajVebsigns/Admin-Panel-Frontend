export interface RegistreeEvent {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  bannerImage?: string;
  location?: { address: string };
}

export interface RegistreeHistoryItem {
  name: string;
  countryCode?: string;
  phoneNumber?: string;
  organization?: string;
  websiteId?: string;
  eventId?: string;
  event?: RegistreeEvent;
  passCode?: string;
  qrCode?: string;
  attended: boolean;
  attendedAt?: string;
  savedAt: string;
}

export interface Registree {
  id: string;
  name: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  organization?: string;
  websiteId?: string | { id: string; name: string; domain?: string; logo?: string };
  eventIds?: RegistreeEvent[];
  history?: RegistreeHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RegistreeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  eventId?: string;
  websiteId?: string;
}

export interface UpdateRegistreeInput {
  name?: string;
  email?: string;
  countryCode?: string;
  phoneNumber?: string;
  organization?: string;
  websiteId?: string;
}

export interface ApiResponseMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedRegistreesResponse {
  data: Registree[];
  meta: ApiResponseMeta;
}
