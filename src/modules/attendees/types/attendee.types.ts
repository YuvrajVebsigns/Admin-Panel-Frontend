export enum AttendeeStatus {
  INVITED = 'INVITED',
  REGISTERED = 'REGISTERED',
  CHECKED_IN = 'CHECKED_IN',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
}

export interface Attendee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  status: AttendeeStatus;
  passCode: string;
  qrCode?: string;
  registeredAt: string;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
}
