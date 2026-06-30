'use client';

import React from 'react';
import {
  CommunicationLog,
  CommunicationChannel,
  CommunicationStatus,
} from '../types/communication.types';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import {
  X,
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
} from 'lucide-react';

interface CommunicationLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: CommunicationLog | null;
}

const CHANNEL_META: Record<
  CommunicationChannel,
  { icon: React.ReactNode; label: string; color: string; bgColor: string }
> = {
  [CommunicationChannel.EMAIL]: {
    icon: <Mail size={16} />,
    label: 'Email',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
  },
  [CommunicationChannel.SMS]: {
    icon: <MessageSquare size={16} />,
    label: 'SMS',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  [CommunicationChannel.PUSH]: {
    icon: <Bell size={16} />,
    label: 'Push Notification',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-500/10',
  },
  [CommunicationChannel.WEBHOOK]: {
    icon: <Link2 size={16} />,
    label: 'Webhook',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-500/10',
  },
};

const STATUS_COLOR: Record<CommunicationStatus, 'warning' | 'success' | 'error' | 'info'> = {
  [CommunicationStatus.PENDING]: 'warning',
  [CommunicationStatus.SENT]: 'success',
  [CommunicationStatus.FAILED]: 'error',
  [CommunicationStatus.REQUESTED]: 'warning',
  [CommunicationStatus.DELIVERED]: 'success',
  [CommunicationStatus.OPENED]: 'info',
  [CommunicationStatus.CLICKED]: 'info',
  [CommunicationStatus.BOUNCED]: 'error',
  [CommunicationStatus.SPAM]: 'error',
  [CommunicationStatus.BLOCKED]: 'error',
};

export const CommunicationLogDetailModal: React.FC<CommunicationLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  if (!isOpen || !log) return null;

  const channelCfg = CHANNEL_META[log.channel];
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Panel: Log Metadata */}
        <div className="w-full md:w-5/12 bg-gray-50 dark:bg-navy-950 p-6 flex flex-col justify-between border-r border-gray-100 dark:border-navy-800 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Log Details</h3>
                <Badge
                  color={STATUS_COLOR[log.status]}
                  className="font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-md border-none shadow-sm"
                >
                  {log.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Communication delivery record and metadata.
              </p>
            </div>

            <div className="space-y-4">
              {/* Channel */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${channelCfg.bgColor} ${channelCfg.color}`}>
                  {channelCfg.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Channel
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    {channelCfg.label}
                  </p>
                </div>
              </div>

              {/* Recipient */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Recipient
                  </p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 break-all">
                    {log.recipient}
                  </p>
                  {log.sender && (
                    <p className="text-[11px] text-gray-400 mt-0.5">Sender: {log.sender}</p>
                  )}
                </div>
              </div>

              {/* Retry Count */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <RotateCcw size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Retry Count
                  </p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {log.retryCount} / 3
                  </p>
                </div>
              </div>

              {/* Created At */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Calendar size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Timestamps
                  </p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Created:{' '}
                    {new Date(log.createdAt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Updated:{' '}
                    {new Date(log.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-navy-800 text-[10px] text-gray-400 dark:text-navy-500 flex items-center justify-between mt-6">
            <span>Log ID:</span>
            <span className="font-mono">{log.id}</span>
          </div>
        </div>

        {/* Right Panel: Content & Error */}
        <div className="w-full md:w-7/12 p-6 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-navy-800 shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="text-brand-500" size={20} />
              <h4 className="font-bold text-gray-900 dark:text-white">Message Content</h4>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Title */}
          {log.title && (
            <div className="pt-4">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                Title / Subject
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{log.title}</p>
            </div>
          )}

          {/* Error Block */}
          {log.status === CommunicationStatus.FAILED && log.error && (
            <div className="mt-4 p-4 bg-error-50 dark:bg-error-500/5 border border-error-100 dark:border-error-500/10 rounded-2xl">
              <div className="flex items-center gap-2 text-error-600 dark:text-error-400 mb-1">
                <AlertTriangle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Delivery Error</span>
              </div>
              <p className="text-sm text-error-700 dark:text-error-300 font-medium">{log.error}</p>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 mt-4">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
              Body Content
            </p>
            <div className="bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800 p-4 overflow-auto max-h-[300px]">
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
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {log.content}
                </p>
              )}
            </div>
          </div>

          {/* Metadata */}
          {hasMetadata && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Code size={14} className="text-gray-400" />
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Metadata
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800 p-3">
                <div className="space-y-1.5">
                  {Object.entries(log.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-900 transition-colors"
                    >
                      <span className="font-mono font-semibold text-gray-500 dark:text-gray-400">
                        {key}
                      </span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-navy-800 shrink-0 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
