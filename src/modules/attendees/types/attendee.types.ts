export enum AttendeeStatus {
  INVITED = 'INVITED',
  REGISTERED = 'REGISTERED',
  CHECKED_IN = 'CHECKED_IN',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
}

export interface Attendee {
  id: string;
  eventId:
    | string
    | {
        id: string;
        title: string;
        type: string;
        startDate: string;
        endDate: string;
        location?: { address: string };
      };
  name: string;
  email: string;
  phoneNumber?: string;
  organization?: string;
  status: AttendeeStatus;
  passCode: string;
  qrCode?: string;
  websiteId?: string | { id: string; name: string; domain?: string; logo?: string };
  registeredAt: string;
  checkedInAt?: string;
  checkedInBy?: {
    userId: string;
    name: string;
    email: string;
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
}

export interface CreateAttendeeInput {
  eventId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  organization?: string;
  status?: AttendeeStatus;
  websiteId?: string;
}

export interface UpdateAttendeeInput {
  status?: AttendeeStatus;
  organization?: string;
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
