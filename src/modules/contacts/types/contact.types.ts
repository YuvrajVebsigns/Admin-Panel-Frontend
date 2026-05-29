export enum ContactStatus {
  PENDING = 'Pending',
  REPLIED = 'Replied',
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  websiteId:
    | {
        id: string;
        _id: string;
        name: string;
        domain: string;
        logo?: string;
      }
    | string;
  status: ContactStatus;
  replyMessage?: string;
  repliedAt?: string;
  repliedBy?:
    | {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export interface ReplyContactDto {
  replyMessage: string;
}

export interface ContactQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactStatus;
  websiteId?: string;
}
