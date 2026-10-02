export interface RegistreeEvent {
  id?: string;
  _id?: string;
  title?: string;
  slug?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  bannerImage?: string;
  location?: { address: string };
}

export interface RegistreeHistoryItem {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  personalEmail?: string;
  countryCode?: string;
  phoneNumber?: string;
  landlineNumber?: string;
  organization?: string;
  jobTitle?: string;
  industryVertical?: string;
  city?: string;
  state?: string;
  country?: string;
  registrationType?: string;
  message?: string;
  sponsorConsent?: boolean;
  websiteId?: string | { id?: string; _id?: string; name?: string; domain?: string };
  eventId?: string;
  event?: RegistreeEvent;
  passCode?: string;
  qrCode?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  attended?: boolean;
  attendedAt?: string;
  savedAt?: string;
  registeredAt?: string;
}

export interface Registree {
  id: string;
  _id?: string;
  name: string;
  email: string;
  personalEmail?: string;
  countryCode?: string;
  phoneNumber?: string;
  landlineNumber?: string;
  organization?: string;
  jobTitle?: string;
  industryVertical?: string;
  city?: string;
  state?: string;
  country?: string;
  tags?: string[];
  websiteId?:
    | string
    | {
        id?: string;
        _id?: string;
        name?: string;
        domain?: string;
        logo?: string;
      };
  eventIds?: RegistreeEvent[];
  history?: RegistreeHistoryItem[];
  latestEvent?: RegistreeEvent;
  latestRegistration?: RegistreeHistoryItem;
  registrationType?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  registeredAt?: string;
  joinedAt?: string;
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
  tags?: string[];
  tag?: string;
  status?: string;
  eventOnly?: boolean;
}

export interface UpdateRegistreeInput {
  name?: string;
  email?: string;
  personalEmail?: string;
  countryCode?: string;
  phoneNumber?: string;
  landlineNumber?: string;
  organization?: string;
  jobTitle?: string;
  industryVertical?: string;
  city?: string;
  state?: string;
  country?: string;
  tags?: string[];
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
