export enum AttendeeStatus {
  INVITED = 'INVITED',
  REGISTERED = 'REGISTERED',
  CHECKED_IN = 'CHECKED_IN',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
}

export interface Attendee {
  id: string;
  _id?: string;
  eventId:
    | string
    | {
        id: string;
        _id?: string;
        title: string;
        slug?: string;
        type: string;
        startDate: string;
        endDate: string;
        location?: { address: string };
        websites?: Array<string | { id?: string; _id?: string; name?: string; domain?: string }>;
      };
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
  registrationType?: string;
  message?: string;
  sponsorConsent?: boolean;
  status: AttendeeStatus;
  passCode: string;
  qrCode?: string;
  websiteId?:
    | string
    | {
        id?: string;
        _id?: string;
        name?: string;
        domain?: string;
        logo?: string;
      };
  registeredAt: string;
  checkedInAt?: string;
  checkedInBy?: {
    userId: string;
    name: string;
    email: string;
  };
  registrationDetails?: {
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
    passCode?: string;
    qrCode?: string;
    registeredAt?: string;
    websiteId?: string | { id?: string; name?: string; domain?: string };
    eventId?: string | { id?: string; title?: string };
    attended?: boolean;
    attendedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AttendeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AttendeeStatus;
  eventId?: string;
  websiteId?: string;
  email?: string;
  registrationType?: string;
}

export interface CreateAttendeeInput {
  eventId: string;
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
  registrationType?: string;
  message?: string;
  sponsorConsent?: boolean;
  status?: AttendeeStatus;
  websiteId?: string;
}

export interface UpdateAttendeeInput {
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
  status?: AttendeeStatus;
  eventId?: string;
  websiteId?: string;
}

export interface ApiResponseMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAttendeesResponse {
  data: Attendee[];
  meta: ApiResponseMeta;
}
