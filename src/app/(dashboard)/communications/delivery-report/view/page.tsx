'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useCommunicationLog,
  useSyncCommunicationLog,
} from '@/modules/communications/hooks/useCommunicationLogs';
import {
  CommunicationChannel,
  CommunicationStatus,
} from '@/modules/communications/types/communication.types';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Bell,
  Link2,
  Calendar,
  RotateCcw,
  AlertTriangle,
  User,
  FileText,
  Code,
  CheckCircle2,
  Info,
  Clock,
  RefreshCw,
} from 'lucide-react';

const CHANNEL_META: Record<
  CommunicationChannel,
  { icon: React.ReactNode; label: string; color: string; bgColor: string }
> = {
  [CommunicationChannel.EMAIL]: {
    icon: <Mail size={18} />,
    label: 'Email',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
  },
  [CommunicationChannel.SMS]: {
    icon: <MessageSquare size={18} />,
    label: 'SMS',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  [CommunicationChannel.PUSH]: {
    icon: <Bell size={18} />,
    label: 'Push Notification',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-500/10',
  },
  [CommunicationChannel.WEBHOOK]: {
    icon: <Link2 size={18} />,
    label: 'Webhook',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-500/10',
  },
};

const STATUS_BADGE_CONFIG: Record<
  CommunicationStatus,
  { text: string; color: 'primary' | 'success' | 'error' | 'warning' | 'info' }
> = {
  [CommunicationStatus.PENDING]: { text: 'Pending', color: 'warning' },
  [CommunicationStatus.SENT]: { text: 'Sent', color: 'success' },
  [CommunicationStatus.FAILED]: { text: 'Failed', color: 'error' },
  [CommunicationStatus.REQUESTED]: { text: 'Requested', color: 'warning' },
  [CommunicationStatus.DELIVERED]: { text: 'Delivered', color: 'success' },
  [CommunicationStatus.OPENED]: { text: 'Opened', color: 'info' },
  [CommunicationStatus.CLICKED]: { text: 'Clicked', color: 'info' },
  [CommunicationStatus.BOUNCED]: { text: 'Bounced', color: 'error' },
  [CommunicationStatus.SPAM]: { text: 'Spam', color: 'error' },
  [CommunicationStatus.BLOCKED]: { text: 'Blocked', color: 'error' },
};

function LogDetailsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const { data: log, isLoading, error } = useCommunicationLog(id);
  const { mutateAsync: syncLog, isPending: isSyncing } = useSyncCommunicationLog();

  const handleSync = async () => {
    try {
      await syncLog(id);
    } catch (e) {}
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading delivery details...
        </p>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto space-y-4">
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">
          <AlertTriangle size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Failed to Load Log</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            The requested communication log details could not be retrieved. Please verify the ID or
            try again.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/communications/delivery-report')}>
          Back to Delivery Report
        </Button>
      </div>
    );
  }

  const channelCfg = CHANNEL_META[log.channel];
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

  interface WebhookEventItem {
    event?: string;
    type?: string;
    reason?: string;
    message?: string;
    timestamp?: string;
    date?: string;
    ip?: string;
  }

  interface WebhookMetadata {
    webhookHistory?: WebhookEventItem[];
    events?: WebhookEventItem[];
  }

  const meta = log.metadata as unknown as WebhookMetadata;
  const webhookEvents: WebhookEventItem[] = meta?.webhookHistory || meta?.events || [];
  const timelineItems = [...webhookEvents];

  // Sort timeline
  timelineItems.sort(
    (a, b) =>
      new Date(a.timestamp || a.date || '').getTime() -
      new Date(b.timestamp || b.date || '').getTime(),
  );

  const baseTimeline = [
    {
      title: 'Message Queued',
      timestamp: log.createdAt,
      description: 'Communication triggered in system and sent to worker queue.',
      status: 'completed',
    },
  ];

  if (log.status === CommunicationStatus.SENT) {
    baseTimeline.push({
      title: 'Dispatched to Provider',
      timestamp: log.updatedAt,
      description: `Successfully processed and delivered to standard provider channel.`,
      status: 'completed',
    });
  } else if (log.status === CommunicationStatus.FAILED) {
    baseTimeline.push({
      title: 'Delivery Failed',
      timestamp: log.updatedAt,
      description: log.error || 'Unknown provider error occurred during dispatch.',
      status: 'failed',
    });
  } else {
    baseTimeline.push({
      title: 'Pending Process',
      timestamp: log.updatedAt,
      description: 'Currently awaiting execution retry or queue processing.',
      status: 'pending',
    });
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/communications/delivery-report')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Log Details</h1>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">ID: {log.id}</p>
          </div>
        </div>

        {log.channel === CommunicationChannel.EMAIL && !!log.metadata?.brevoMessageId && (
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 border-brand-500 text-brand-600 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 font-semibold rounded-xl text-sm"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Fetch Latest Update'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Summary & Timeline */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary Card */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                Overview
              </span>
              {(() => {
                const badge = STATUS_BADGE_CONFIG[log.status as CommunicationStatus] || {
                  text: log.status,
                  color: 'primary',
                };
                return (
                  <Badge
                    color={badge.color}
                    className="font-bold text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-lg border-none shadow-sm"
                  >
                    {badge.text}
                  </Badge>
                );
              })()}
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${channelCfg.bgColor} ${channelCfg.color} shadow-sm`}
                >
                  {channelCfg.icon}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Channel
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    {channelCfg.label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shadow-sm">
                  <User size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Recipient
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white truncate break-all">
                    {log.recipient}
                  </p>
                  {log.sender && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      from: {log.sender}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shadow-sm">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Retry Attempt
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    {log.retryCount} / 3
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shadow-sm">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Timestamp
                  </p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Created:{' '}
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Timeline Card */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">
              Delivery Timeline
            </h3>

            <div className="relative border-l border-gray-100 dark:border-navy-800 ml-4 pl-6 space-y-8">
              {/* Internal system timeline first */}
              {baseTimeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-navy-900 ring-4 ring-white dark:ring-navy-900">
                    {item.status === 'completed' && (
                      <CheckCircle2 className="h-4.5 w-4.5 text-green-500 fill-green-50 dark:fill-navy-900" />
                    )}
                    {item.status === 'failed' && (
                      <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                    )}
                    {item.status === 'pending' && <Clock className="h-4.5 w-4.5 text-amber-500" />}
                  </span>

                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {new Date(item.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Webhook update items */}
              {timelineItems.map((evt, idx) => {
                const eventName = evt.event || evt.type || 'Webhook Event';
                const eventDesc =
                  evt.reason ||
                  evt.message ||
                  `Provider callback registered status "${eventName}".`;
                const timestamp = evt.timestamp || evt.date || new Date().toISOString();
                const isFail = ['failed', 'bounced', 'blocked', 'error', 'invalid_parameter'].some(
                  (s) => eventName.toLowerCase().includes(s),
                );
                const isSuccess = [
                  'delivered',
                  'delivered_to_recipient',
                  'sent',
                  'processed',
                  'opened',
                  'clicked',
                ].some((s) => eventName.toLowerCase().includes(s));

                return (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-navy-900 ring-4 ring-white dark:ring-navy-900">
                      {isFail ? (
                        <AlertTriangle className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-blue-500 fill-blue-50 dark:fill-navy-900" />
                      ) : (
                        <Info className="h-4.5 w-4.5 text-gray-400" />
                      )}
                    </span>

                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white capitalize">
                        {eventName.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {new Date(timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
                        {eventDesc}
                      </p>
                      {evt.ip && (
                        <span className="inline-block bg-gray-50 dark:bg-navy-950 px-1.5 py-0.5 rounded text-[10px] text-gray-400 font-mono mt-1">
                          IP: {evt.ip}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Message Body & Metadata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Card */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-navy-800">
              <FileText className="text-brand-500" size={20} />
              <h3 className="font-bold text-gray-900 dark:text-white">Message Payload</h3>
            </div>

            {log.title && (
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                  Subject / Title
                </p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{log.title}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                Body Content
              </p>
              <div className="bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800 p-6 overflow-auto max-h-[500px]">
                {log.channel === CommunicationChannel.EMAIL ? (
                  <div
                    className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: log.content }}
                  />
                ) : log.channel === CommunicationChannel.WEBHOOK ? (
                  <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap break-all">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(log.content), null, 2);
                      } catch {
                        return log.content;
                      }
                    })()}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium">
                    {log.content}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata & Raw Response Card */}
          {hasMetadata && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <Code className="text-gray-400" size={18} />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Raw Attributes & Webhook Payload
                </h3>
              </div>

              <div className="bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800 p-4">
                <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono overflow-auto max-h-[300px] whitespace-pre-wrap">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LogDetailsViewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Loading delivery details...
          </p>
        </div>
      }
    >
      <LogDetailsInner />
    </Suspense>
  );
}
