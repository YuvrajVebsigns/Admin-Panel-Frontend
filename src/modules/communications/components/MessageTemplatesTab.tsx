'use client';

import React, { useState } from 'react';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import { MessageTemplate, CommunicationChannel } from '../types/communication.types';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { useRouter } from 'next/navigation';
import { TemplateSendModal } from './TemplateSendModal';
import {
  Mail,
  MessageSquare,
  Bell,
  RefreshCw,
  Edit,
  Trash2,
  Send,
  CloudDownload,
  FileCode,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MessageTemplatesTabProps {
  channel?: CommunicationChannel;
}

export const MessageTemplatesTab: React.FC<MessageTemplatesTabProps> = ({ channel }) => {
  const router = useRouter();
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    channel?: CommunicationChannel;
  }>({
    page: 1,
    limit: 10,
    search: '',
    channel: channel,
  });

  React.useEffect(() => {
    setParams((p) => ({ ...p, channel, page: 1 }));
  }, [channel]);

  const {
    templates,
    meta,
    isLoading,
    syncToProvider,
    syncFromProvider,
    deleteTemplate,
    syncAllTemplates,
    isSyncingAll,
  } = useMessageTemplates(params);

  // Modal control states
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isSendOpen, setIsSendOpen] = useState(false);

  // Pull sync state
  const [externalIdInput, setExternalIdInput] = useState('');
  const [isPulling, setIsPulling] = useState(false);

  const handleEdit = (template: MessageTemplate) => {
    router.push(`/communications/templates/${template.id}/edit`);
  };

  const handleCreate = () => {
    router.push(`/communications/templates/create${channel ? `?channel=${channel}` : ''}`);
  };

  const handleTestSend = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setIsSendOpen(true);
  };

  const handleSyncToProvider = async (template: MessageTemplate) => {
    const loader = toast.loading(`Pushing template "${template.name}" to Brevo...`);
    try {
      await syncToProvider(template.id);
    } catch {
      // Toast handles error message
    } finally {
      toast.dismiss(loader);
    }
  };

  const handlePullSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalIdInput.trim() || isNaN(Number(externalIdInput))) {
      toast.error('Please enter a valid numeric Brevo template ID');
      return;
    }

    setIsPulling(true);
    const loader = toast.loading(`Pulling template ${externalIdInput} from Brevo SMTP...`);
    try {
      await syncFromProvider(Number(externalIdInput));
      setExternalIdInput('');
    } catch {
      // Toast handles error message
    } finally {
      toast.dismiss(loader);
      setIsPulling(false);
    }
  };

  const handleSyncAll = async () => {
    const loader = toast.loading('Synchronizing all templates with Brevo...');
    try {
      await syncAllTemplates();
    } catch {
      // Toast handles error message
    } finally {
      toast.dismiss(loader);
    }
  };

  const handleDelete = async (template: MessageTemplate) => {
    if (window.confirm(`Are you sure you want to delete template: ${template.name}?`)) {
      try {
        await deleteTemplate(template.id);
      } catch {
        // Handle error
      }
    }
  };

  const CHANNEL_CONFIG: Record<
    CommunicationChannel,
    { icon: React.ReactNode; label: string; color: string; bgColor: string }
  > = {
    [CommunicationChannel.EMAIL]: {
      icon: <Mail size={13} />,
      label: 'Email',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    },
    [CommunicationChannel.SMS]: {
      icon: <MessageSquare size={13} />,
      label: 'SMS',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    [CommunicationChannel.PUSH]: {
      icon: <Bell size={13} />,
      label: 'Push',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
    },
    [CommunicationChannel.WEBHOOK]: {
      icon: <FileCode size={13} />,
      label: 'Webhook',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10',
    },
  };

  const columns: Column<MessageTemplate>[] = [
    {
      header: 'Template Detail',
      accessor: (tpl) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white text-sm">{tpl.name}</span>
          <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">
            slug: {tpl.slug}
          </span>
        </div>
      ),
    },
    {
      header: 'Channel',
      accessor: (tpl) => {
        const cfg = CHANNEL_CONFIG[tpl.channel];
        return (
          <Badge
            color={tpl.channel === 'email' ? 'info' : tpl.channel === 'sms' ? 'success' : 'warning'}
            className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-lg border-none"
          >
            {cfg.icon}
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      header: 'Variables Detected',
      accessor: (tpl) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {tpl.variables && tpl.variables.length > 0 ? (
            tpl.variables.map((v) => (
              <span
                key={v}
                className="text-[10px] font-mono bg-gray-100 dark:bg-navy-950 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded"
              >
                {v}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-gray-400">None</span>
          )}
        </div>
      ),
    },
    {
      header: 'Sync status (Brevo)',
      accessor: (tpl) => {
        if (tpl.channel !== 'email') {
          return <span className="text-xs text-gray-400">N/A</span>;
        }

        const sync = tpl.providerSync?.brevo;
        if (!sync) {
          return (
            <Badge color="warning" className="text-[10px] font-bold">
              Unsynchronized
            </Badge>
          );
        }

        if (sync.syncStatus === 'synced') {
          return (
            <div className="flex flex-col gap-0.5">
              <Badge color="success" className="text-[10px] font-bold w-fit">
                Synced
              </Badge>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                ID: {sync.templateId}
              </span>
            </div>
          );
        }

        if (sync.syncStatus === 'failed') {
          return (
            <div
              className="flex flex-col gap-0.5 max-w-[120px]"
              title={sync.error || 'Failed sync'}
            >
              <Badge color="error" className="text-[10px] font-bold w-fit">
                Sync Failed
              </Badge>
              <span className="text-[9px] text-error-400 truncate block">{sync.error}</span>
            </div>
          );
        }

        return (
          <Badge color="warning" className="text-[10px] font-bold">
            Pending Sync
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (tpl) => (
        <div className="flex items-center gap-1.5">
          {/* Edit Template */}
          <button
            onClick={() => handleEdit(tpl)}
            className="p-1.5 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 bg-gray-50 dark:bg-navy-950 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all"
            title="Edit Layout Details"
          >
            <Edit size={13} />
          </button>

          {/* Force Push Sync (only for email layouts) */}
          {tpl.channel === 'email' && (
            <button
              onClick={() => handleSyncToProvider(tpl)}
              className="p-1.5 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 bg-gray-50 dark:bg-navy-950 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all"
              title="Push Sync to Brevo"
            >
              <RefreshCw size={13} />
            </button>
          )}

          {/* Test Send Trigger */}
          <button
            onClick={() => handleTestSend(tpl)}
            className="p-1.5 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 bg-gray-50 dark:bg-navy-950 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all"
            title="Dispatch Test Alert"
          >
            <Send size={13} />
          </button>

          {/* Remove Local Template */}
          <button
            onClick={() => handleDelete(tpl)}
            className="p-1.5 text-gray-400 hover:text-error-500 bg-gray-50 dark:bg-navy-950 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg transition-all"
            title="Delete Local Template"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search filters & sync pulls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: search box */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={params.search}
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white min-w-[200px]"
          />

          {!channel && (
            <select
              value={params.channel || ''}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  channel: (e.target.value as CommunicationChannel) || undefined,
                  page: 1,
                }))
              }
              className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Channels</option>
              <option value={CommunicationChannel.EMAIL}>📧 Email</option>
              <option value={CommunicationChannel.SMS}>💬 SMS</option>
              <option value={CommunicationChannel.PUSH}>🔔 Push</option>
            </select>
          )}
        </div>

        {/* Right: Pull Sync form */}
        <form onSubmit={handlePullSync} className="flex items-center gap-2">
          {!channel || channel === CommunicationChannel.EMAIL ? (
            <>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleSyncAll}
                isLoading={isSyncingAll}
                startIcon={<RefreshCw size={13} />}
                className="text-brand-500 border-brand-500/25 hover:bg-brand-50/50"
              >
                Sync with Brevo
              </Button>
              <input
                type="text"
                value={externalIdInput}
                onChange={(e) => setExternalIdInput(e.target.value)}
                placeholder="Brevo Template ID..."
                className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white w-40 text-center font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                type="submit"
                isLoading={isPulling}
                startIcon={<CloudDownload size={13} />}
              >
                Import
              </Button>
            </>
          ) : null}

          <Button
            variant="primary"
            size="sm"
            onClick={handleCreate}
            startIcon={<FileCode size={13} />}
          >
            Create
          </Button>
        </form>
      </div>

      <DataTable
        data={templates}
        columns={columns}
        isLoading={isLoading}
        serverSide
        totalItems={meta?.total}
        page={params.page}
        limit={params.limit}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
        onPageSizeChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
      />

      {/* Tester Modal */}
      <TemplateSendModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        template={selectedTemplate}
      />
    </div>
  );
};
