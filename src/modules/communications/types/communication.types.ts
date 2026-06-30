export enum CommunicationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
}

export enum CommunicationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  REQUESTED = 'requested',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  SPAM = 'spam',
  BLOCKED = 'blocked',
}

export interface CommunicationLog {
  id: string;
  channel: CommunicationChannel;
  recipient: string;
  sender: string | null;
  title: string | null;
  content: string;
  status: CommunicationStatus;
  error: string | null;
  metadata: Record<string, unknown>;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderSyncInfo {
  templateId?: number;
  syncedAt?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  error?: string | null;
}

export interface MessageTemplate {
  id: string;
  name: string;
  slug: string;
  channel: CommunicationChannel;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  providerSync: {
    brevo?: ProviderSyncInfo;
    sendgrid?: ProviderSyncInfo;
  };
  senderEmail?: string;
  senderName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationProvider {
  id: string;
  name: string;
  displayName: string;
  channel: CommunicationChannel;
  priority: number;
  isActive: boolean;
  credentials: Record<string, string>;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  channel?: CommunicationChannel;
  status?: CommunicationStatus;
}

export interface WebhookQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface MessageTemplateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  channel?: CommunicationChannel;
  isActive?: boolean;
}

export interface SendMessageDto {
  channel: CommunicationChannel;
  recipient: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface CreateWebhookDto {
  url: string;
  events: string[];
  secret: string;
  isActive?: boolean;
}

export interface UpdateWebhookDto {
  url?: string;
  events?: string[];
  secret?: string;
  isActive?: boolean;
}

export interface CreateCommunicationProviderDto {
  name: string;
  displayName: string;
  channel: CommunicationChannel;
  priority?: number;
  isActive?: boolean;
  credentials?: Record<string, string>;
  config?: Record<string, unknown>;
}

export interface UpdateCommunicationProviderDto {
  displayName?: string;
  priority?: number;
  isActive?: boolean;
  credentials?: Record<string, string>;
  config?: Record<string, unknown>;
}

export interface CreateMessageTemplateDto {
  name: string;
  slug: string;
  channel: CommunicationChannel;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: string[];
  senderEmail?: string;
  senderName?: string;
  isActive?: boolean;
}

export interface UpdateMessageTemplateDto {
  name?: string;
  channel?: CommunicationChannel;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: string[];
  senderEmail?: string;
  senderName?: string;
  isActive?: boolean;
}

export interface SendTemplateMessageDto {
  slug: string;
  recipient: string;
  recipientName?: string;
  params?: Record<string, unknown>;
}

export interface EventTemplateMapping {
  id: string;
  event: string;
  templateId: MessageTemplate;
  senderEmail?: string;
  senderName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventTemplateMappingDto {
  event: string;
  templateId: string;
  senderEmail?: string;
  senderName?: string;
  isActive?: boolean;
}

export interface UpdateEventTemplateMappingDto {
  event?: string;
  templateId?: string;
  senderEmail?: string;
  senderName?: string;
  isActive?: boolean;
}

export interface BrevoSender {
  id: number;
  name: string;
  email: string;
  active: boolean;
}
