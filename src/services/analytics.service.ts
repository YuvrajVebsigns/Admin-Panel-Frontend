import { apiFetch } from '@/services/apiFetch';

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsSummary {
  metrics: {
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
    consentAccepts: number;
    consentDeclines: number;
    consentRate: number;
  };
  topPages: Array<{
    pageUrl: string;
    pageTitle: string;
    count: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    pageViews: number;
    uniqueVisitors: number;
  }>;
  recentActivity: Array<{
    id: string;
    visitorId: string;
    sessionId: string;
    eventType: string;
    pageUrl?: string;
    pageTitle?: string;
    referrer?: string;
    userAgent?: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
  }>;
}

export const analyticsService = {
  getSummary: async (websiteId: string, params: AnalyticsQuery = {}): Promise<AnalyticsSummary> => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    queryParams.append('showMetadata', 'true');

    return apiFetch<AnalyticsSummary>(
      `/admin/analytics/${websiteId}/summary?${queryParams.toString()}`,
    );
  },
};
