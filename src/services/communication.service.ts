import { apiFetch } from '@/services/apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import {
  CommunicationLog,
  CommunicationLogQueryParams,
  SendMessageDto,
  WebhookSubscription,
  WebhookQueryParams,
  CreateWebhookDto,
  UpdateWebhookDto,
  CommunicationProvider,
  CreateCommunicationProviderDto,
  UpdateCommunicationProviderDto,
  MessageTemplate,
  MessageTemplateQueryParams,
  CreateMessageTemplateDto,
  UpdateMessageTemplateDto,
  SendTemplateMessageDto,
  EventTemplateMapping,
  CreateEventTemplateMappingDto,
  UpdateEventTemplateMappingDto,
  BrevoSender,
} from '@/modules/communications/types/communication.types';

const BASE = '/admin/communications';

export const communicationService = {
  // ── Communication Logs ──────────────────────────────────────────

  getLogs: async (
    params: CommunicationLogQueryParams = {},
  ): Promise<PaginatedResponse<CommunicationLog>> => {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', params.page.toString());
    if (params.limit) qp.append('limit', params.limit.toString());
    if (params.search) qp.append('search', params.search);
    if (params.channel) qp.append('channel', params.channel);
    if (params.status) qp.append('status', params.status);
    qp.append('showMetadata', 'true');

    return apiFetch<PaginatedResponse<CommunicationLog>>(`${BASE}/logs?${qp.toString()}`);
  },

  getLog: async (id: string): Promise<CommunicationLog> => {
    return apiFetch<CommunicationLog>(`${BASE}/logs/${id}?showMetadata=true`);
  },

  syncLog: async (id: string): Promise<CommunicationLog> => {
    return apiFetch<CommunicationLog>(`${BASE}/logs/${id}/sync`, {
      method: 'POST',
    });
  },

  // ── Send Manual Message ─────────────────────────────────────────

  sendMessage: async (data: SendMessageDto): Promise<CommunicationLog> => {
    return apiFetch<CommunicationLog>(`${BASE}/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ── Communication Providers (Plugins) ───────────────────────────

  getProviders: async (): Promise<CommunicationProvider[]> => {
    return apiFetch<CommunicationProvider[]>(`${BASE}/providers`);
  },

  createProvider: async (data: CreateCommunicationProviderDto): Promise<CommunicationProvider> => {
    return apiFetch<CommunicationProvider>(`${BASE}/providers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProvider: async (
    id: string,
    data: UpdateCommunicationProviderDto,
  ): Promise<CommunicationProvider> => {
    return apiFetch<CommunicationProvider>(`${BASE}/providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteProvider: async (id: string): Promise<void> => {
    return apiFetch<void>(`${BASE}/providers/${id}`, {
      method: 'DELETE',
    });
  },

  checkProviderHealth: async (
    name: string,
  ): Promise<{ name: string; isHealthy: boolean; error?: string }> => {
    return apiFetch<{ name: string; isHealthy: boolean; error?: string }>(
      `${BASE}/providers/${name}/health`,
    );
  },

  registerBrevoWebhook: async (
    url: string,
  ): Promise<{ success: boolean; webhookId: number; url: string }> => {
    return apiFetch<{ success: boolean; webhookId: number; url: string }>(
      `${BASE}/providers/brevo/webhook`,
      {
        method: 'POST',
        body: JSON.stringify({ url }),
      },
    );
  },

  unregisterBrevoWebhook: async (): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`${BASE}/providers/brevo/webhook`, {
      method: 'DELETE',
    });
  },

  getBrevoSenders: async (): Promise<{ senders: BrevoSender[] } | BrevoSender[]> => {
    return apiFetch<{ senders: BrevoSender[] } | BrevoSender[]>(`${BASE}/providers/brevo/senders`);
  },

  createBrevoSender: async (data: {
    email: string;
    name: string;
  }): Promise<{ success: boolean; sender?: BrevoSender }> => {
    return apiFetch<{ success: boolean; sender?: BrevoSender }>(`${BASE}/providers/brevo/senders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteBrevoSender: async (id: number): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`${BASE}/providers/brevo/senders/${id}`, {
      method: 'DELETE',
    });
  },

  // ── Message Templates ───────────────────────────────────────────

  getTemplates: async (
    params: MessageTemplateQueryParams = {},
  ): Promise<PaginatedResponse<MessageTemplate>> => {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', params.page.toString());
    if (params.limit) qp.append('limit', params.limit.toString());
    if (params.search) qp.append('search', params.search);
    if (params.channel) qp.append('channel', params.channel);
    if (params.isActive !== undefined) qp.append('isActive', params.isActive.toString());

    return apiFetch<PaginatedResponse<MessageTemplate>>(`${BASE}/templates?${qp.toString()}`);
  },

  getTemplate: async (id: string): Promise<MessageTemplate> => {
    return apiFetch<MessageTemplate>(`${BASE}/templates/${id}`);
  },

  createTemplate: async (data: CreateMessageTemplateDto): Promise<MessageTemplate> => {
    return apiFetch<MessageTemplate>(`${BASE}/templates`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTemplate: async (id: string, data: UpdateMessageTemplateDto): Promise<MessageTemplate> => {
    return apiFetch<MessageTemplate>(`${BASE}/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteTemplate: async (id: string): Promise<void> => {
    return apiFetch<void>(`${BASE}/templates/${id}`, {
      method: 'DELETE',
    });
  },

  // ── Template Synchronization ────────────────────────────────────

  syncTemplateToProvider: async (id: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`${BASE}/templates/${id}/sync/to-provider`, {
      method: 'POST',
    });
  },

  syncTemplateFromProvider: async (externalId: number): Promise<MessageTemplate> => {
    return apiFetch<MessageTemplate>(`${BASE}/templates/sync/from-provider/${externalId}`, {
      method: 'POST',
    });
  },

  syncAllTemplates: async (): Promise<{
    imported: number;
    updated: number;
    pushed: number;
    failed: number;
  }> => {
    return apiFetch<{
      imported: number;
      updated: number;
      pushed: number;
      failed: number;
    }>(`${BASE}/templates/sync`, {
      method: 'POST',
    });
  },

  sendTemplateMessage: async (data: SendTemplateMessageDto): Promise<CommunicationLog> => {
    return apiFetch<CommunicationLog>(`${BASE}/templates/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ── Webhook Subscriptions ───────────────────────────────────────

  getWebhooks: async (
    params: WebhookQueryParams = {},
  ): Promise<PaginatedResponse<WebhookSubscription>> => {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', params.page.toString());
    if (params.limit) qp.append('limit', params.limit.toString());
    if (params.search) qp.append('search', params.search);
    if (params.isActive !== undefined) qp.append('isActive', params.isActive.toString());

    return apiFetch<PaginatedResponse<WebhookSubscription>>(`${BASE}/webhooks?${qp.toString()}`);
  },

  getWebhook: async (id: string): Promise<WebhookSubscription> => {
    return apiFetch<WebhookSubscription>(`${BASE}/webhooks/${id}`);
  },

  createWebhook: async (data: CreateWebhookDto): Promise<WebhookSubscription> => {
    return apiFetch<WebhookSubscription>(`${BASE}/webhooks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateWebhook: async (id: string, data: UpdateWebhookDto): Promise<WebhookSubscription> => {
    return apiFetch<WebhookSubscription>(`${BASE}/webhooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteWebhook: async (id: string): Promise<void> => {
    return apiFetch<void>(`${BASE}/webhooks/${id}`, {
      method: 'DELETE',
    });
  },

  // ── System Events Discovery ──────────────────────────────────────

  getSystemEvents: async (): Promise<{
    events: string[];
    categories: Record<string, { key: string; value: string }[]>;
    payloadRegistry: Record<string, { field: string; type: string; description: string }[]>;
  }> => {
    return apiFetch<{
      events: string[];
      categories: Record<string, { key: string; value: string }[]>;
      payloadRegistry: Record<string, { field: string; type: string; description: string }[]>;
    }>(`${BASE}/system-events`);
  },

  // ── Event Mappings CRUD ──────────────────────────────────────────

  getEventMappings: async (): Promise<EventTemplateMapping[]> => {
    return apiFetch<EventTemplateMapping[]>(`${BASE}/event-mappings`);
  },

  createEventMapping: async (
    data: CreateEventTemplateMappingDto,
  ): Promise<EventTemplateMapping> => {
    return apiFetch<EventTemplateMapping>(`${BASE}/event-mappings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEventMapping: async (
    id: string,
    data: UpdateEventTemplateMappingDto,
  ): Promise<EventTemplateMapping> => {
    return apiFetch<EventTemplateMapping>(`${BASE}/event-mappings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteEventMapping: async (id: string): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`${BASE}/event-mappings/${id}`, {
      method: 'DELETE',
    });
  },
};
