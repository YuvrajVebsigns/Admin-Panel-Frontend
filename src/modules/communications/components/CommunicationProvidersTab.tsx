'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useCommunicationProviders } from '../hooks/useCommunicationProviders';
import { CommunicationProvider, BrevoSender } from '../types/communication.types';
import { ProviderFormModal } from './ProviderFormModal';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import {
  Activity,
  Edit,
  Trash2,
  ShieldCheck,
  Mail,
  MessageSquare,
  Bell,
  Star,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  Link,
  ChevronDown,
  ChevronUp,
  Globe,
  AlertCircle,
  UserPlus,
  RefreshCw,
} from 'lucide-react';

type TestResult = 'idle' | 'testing' | 'success' | 'failure';

export const CommunicationProvidersTab: React.FC = () => {
  const {
    providers,
    isLoading,
    updateProvider,
    deleteProvider,
    testApiKey,
    registerBrevoWebhook,
    isRegisteringWebhook,
    unregisterBrevoWebhook,
    isUnregisteringWebhook,
    senders,
    isLoadingSenders,
    refetchSenders,
    createBrevoSender,
    isCreatingSender,
    deleteBrevoSender,
    isDeletingSender,
  } = useCommunicationProviders();

  const [selectedProvider, setSelectedProvider] = useState<CommunicationProvider | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testErrors, setTestErrors] = useState<Record<string, string>>({});
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const testTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const [isBrevoExpanded, setIsBrevoExpanded] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const [isSendersExpanded, setIsSendersExpanded] = useState(false);
  const [newSenderEmail, setNewSenderEmail] = useState('');
  const [newSenderName, setNewSenderName] = useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (origin.includes('localhost:3000')) {
        setWebhookUrl('http://localhost:8080/api/v1/webhooks/brevo');
      } else {
        setWebhookUrl(`${origin}/api/v1/webhooks/brevo`);
      }
    }
  }, []);

  const handleRegisterWebhook = async () => {
    if (!webhookUrl.trim()) return;
    try {
      await registerBrevoWebhook(webhookUrl);
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleUnregisterWebhook = async () => {
    if (
      window.confirm(
        'Are you sure you want to unregister and delete this Brevo webhook subscription?',
      )
    ) {
      try {
        await unregisterBrevoWebhook();
      } catch {
        // Error handled by mutation toast
      }
    }
  };

  const handleAddSender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSenderEmail.trim() || !newSenderName.trim()) return;
    try {
      await createBrevoSender({ email: newSenderEmail, name: newSenderName });
      setNewSenderEmail('');
      setNewSenderName('');
    } catch {
      // Handled by hook toast
    }
  };

  const handleDeleteSender = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this sender from Brevo?')) {
      try {
        await deleteBrevoSender(id);
      } catch {
        // Handled by hook toast
      }
    }
  };

  const handleEdit = (provider: CommunicationProvider) => {
    setSelectedProvider(provider);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedProvider(null);
    setIsFormOpen(true);
  };

  const handleToggleActive = async (provider: CommunicationProvider) => {
    setTogglingIds((prev) => new Set(prev).add(provider.id));
    try {
      await updateProvider({
        id: provider.id,
        data: { isActive: !provider.isActive },
      });
    } catch {
      // Toast handles error message
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(provider.id);
        return next;
      });
    }
  };

  const handleTestApiKey = useCallback(
    async (provider: CommunicationProvider) => {
      const key = provider.name;

      // Clear any existing auto-clear timer
      if (testTimers.current[key]) {
        clearTimeout(testTimers.current[key]);
      }

      setTestResults((prev) => ({ ...prev, [key]: 'testing' }));
      setTestErrors((prev) => ({ ...prev, [key]: '' }));

      try {
        const result = await testApiKey(provider.name);
        const status: TestResult = result.isHealthy ? 'success' : 'failure';
        setTestResults((prev) => ({ ...prev, [key]: status }));
        if (!result.isHealthy && result.error) {
          setTestErrors((prev) => ({ ...prev, [key]: result.error! }));
        }
      } catch {
        setTestResults((prev) => ({ ...prev, [key]: 'failure' }));
        setTestErrors((prev) => ({
          ...prev,
          [key]: 'Failed to reach the server. Check network connection.',
        }));
      }
    },
    [testApiKey],
  );

  const handleDelete = async (provider: CommunicationProvider) => {
    if (
      window.confirm(
        `Are you sure you want to remove configured settings for ${provider.displayName}?`,
      )
    ) {
      try {
        await deleteProvider(provider.id);
      } catch {
        // Handle error
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading configured providers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar within tab */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Communication Providers
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configure integration keys and priority settings for dynamic delivery channels.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleCreate}
          startIcon={<ShieldCheck size={14} />}
        >
          Add Provider
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-navy-950 border border-dashed border-gray-200 dark:border-navy-800 rounded-3xl text-center">
          <Activity size={40} className="text-gray-400 mb-3" />
          <p className="text-sm font-bold text-gray-800 dark:text-white">No Providers Registered</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            Add integration keys for messaging endpoints like Brevo, Sendgrid, Twilio or Firebase.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleCreate}>
            Add Provider
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((provider) => {
            const isBrevo = provider.name.toLowerCase() === 'brevo';
            return (
              <div
                key={provider.id}
                className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Channel Indicator Badge */}
                <div className="absolute top-6 right-6">
                  {provider.channel === 'email' && (
                    <Badge
                      color="info"
                      className="flex items-center gap-1 font-bold text-[10px] rounded-lg"
                    >
                      <Mail size={10} /> Email
                    </Badge>
                  )}
                  {provider.channel === 'sms' && (
                    <Badge
                      color="success"
                      className="flex items-center gap-1 font-bold text-[10px] rounded-lg"
                    >
                      <MessageSquare size={10} /> SMS
                    </Badge>
                  )}
                  {provider.channel === 'push' && (
                    <Badge
                      color="warning"
                      className="flex items-center gap-1 font-bold text-[10px] rounded-lg"
                    >
                      <Bell size={10} /> Push
                    </Badge>
                  )}
                </div>

                {/* Body Content */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black uppercase text-xs">
                      {provider.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        {provider.displayName}
                      </h3>
                      <p className="text-[11px] font-semibold text-gray-400 capitalize mt-0.5">
                        Code: {provider.name}
                      </p>
                    </div>
                  </div>

                  {/* Priority and Config info */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-50 dark:border-navy-950 text-xs">
                    <div>
                      <p className="text-gray-400 font-semibold mb-0.5">Priority</p>
                      <span className="font-bold text-gray-800 dark:text-white flex items-center gap-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        {provider.priority}
                      </span>
                    </div>

                    <div>
                      <p className="text-gray-400 font-semibold mb-0.5">Sender Info</p>
                      <span className="font-bold text-gray-700 dark:text-gray-300 truncate block max-w-full">
                        {isBrevo
                          ? `${provider.config?.senderName || 'Not Set'} (${provider.config?.senderEmail || 'Not Set'})`
                          : 'Default settings'}
                      </span>
                    </div>

                    <div>
                      <p className="text-gray-400 font-semibold mb-0.5">Admin Email</p>
                      <span className="font-bold text-gray-700 dark:text-gray-300 truncate block max-w-full">
                        {(provider.config?.adminEmail as string) || 'Not Set'}
                      </span>
                    </div>
                  </div>

                  {/* Test API Key Button */}
                  <div className="pt-1">
                    {(() => {
                      const testState = testResults[provider.name] || 'idle';
                      const isTesting = testState === 'testing';
                      const isSuccess = testState === 'success';
                      const isFailure = testState === 'failure';

                      return (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={isTesting}
                            onClick={() => handleTestApiKey(provider)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                              isTesting
                                ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-500 cursor-wait'
                                : isSuccess
                                  ? 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400'
                                  : isFailure
                                    ? 'bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400'
                                    : 'bg-gray-50 dark:bg-navy-950 text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400'
                            } border ${
                              isSuccess
                                ? 'border-success-200 dark:border-success-500/20'
                                : isFailure
                                  ? 'border-error-200 dark:border-error-500/20'
                                  : 'border-gray-100 dark:border-navy-800'
                            }`}
                          >
                            {isTesting && <Loader2 size={13} className="animate-spin" />}
                            {isSuccess && <CheckCircle size={13} />}
                            {isFailure && <XCircle size={13} />}
                            {testState === 'idle' && <Zap size={13} />}
                            <span>
                              {isTesting
                                ? 'Testing Connection…'
                                : isSuccess
                                  ? 'API Key Verified'
                                  : isFailure
                                    ? 'Connection Failed'
                                    : 'Test API Key'}
                            </span>
                          </button>

                          {isSuccess && (
                            <span className="text-[10px] font-semibold text-success-500 animate-pulse">
                              ✓ API is reachable
                            </span>
                          )}
                          {isFailure && testErrors[provider.name] && (
                            <div className="mt-2 p-3 bg-error-50 dark:bg-error-500/5 border border-error-200 dark:border-error-500/20 rounded-xl">
                              <div className="flex items-start gap-2">
                                <AlertCircle size={14} className="text-error-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <p className="text-[11px] font-bold text-error-600 dark:text-error-400">
                                    Connection Failed
                                  </p>
                                  <p className="text-[11px] text-error-600/80 dark:text-error-400/80 leading-relaxed break-words whitespace-pre-wrap">
                                    {testErrors[provider.name]}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {isFailure && !testErrors[provider.name] && (
                            <span className="text-[10px] font-semibold text-error-500">
                              ✗ Check credentials and retry
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {isBrevo && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-navy-800 space-y-3">
                      <button
                        type="button"
                        onClick={() => setIsBrevoExpanded(!isBrevoExpanded)}
                        className="flex items-center justify-between w-full text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brand-500 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Globe size={13} className="text-brand-500" />
                          Delivery Tracking Webhook
                        </span>
                        {isBrevoExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isBrevoExpanded && (
                        <div className="bg-gray-50 dark:bg-navy-950 p-4 rounded-2xl border border-gray-100 dark:border-navy-800 space-y-3 animate-fadeIn">
                          {(provider.config as Record<string, unknown>)?.brevoWebhookId ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                  <CheckCircle size={10} /> Configured & Active
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold">
                                  ID:{' '}
                                  {String(
                                    (provider.config as Record<string, unknown>).brevoWebhookId,
                                  )}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">
                                  Registered Webhook URL
                                </label>
                                <div className="flex items-center gap-1.5 bg-white dark:bg-navy-900 px-3 py-2 rounded-xl border border-gray-100 dark:border-navy-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300 break-all select-all">
                                  <Link size={11} className="text-gray-400 shrink-0" />
                                  {String(
                                    (provider.config as Record<string, unknown>).brevoWebhookUrl ||
                                      '',
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="error"
                                size="sm"
                                className="w-full justify-center text-[10px] py-1.5 h-auto font-bold"
                                disabled={isUnregisteringWebhook}
                                onClick={handleUnregisterWebhook}
                                startIcon={
                                  isUnregisteringWebhook ? (
                                    <Loader2 size={10} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={10} />
                                  )
                                }
                              >
                                Delete Webhook Subscription
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                Automate real-time email event tracking (delivered, bounce, spam,
                                open, clicks) by registering your server webhook endpoint on Brevo.
                              </p>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">
                                  Webhook Target URL
                                </label>
                                <input
                                  type="url"
                                  value={webhookUrl}
                                  onChange={(e) => setWebhookUrl(e.target.value)}
                                  placeholder="https://yourdomain.com/api/v1/webhooks/brevo"
                                  className="w-full bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 px-3 py-2 rounded-xl text-xs text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 placeholder-gray-400"
                                />
                              </div>
                              <Button
                                variant="primary"
                                size="sm"
                                className="w-full justify-center text-[10px] py-1.5 h-auto font-bold"
                                disabled={isRegisteringWebhook || !webhookUrl.trim()}
                                onClick={handleRegisterWebhook}
                                startIcon={
                                  isRegisteringWebhook ? (
                                    <Loader2 size={10} className="animate-spin" />
                                  ) : (
                                    <Globe size={10} />
                                  )
                                }
                              >
                                Register Webhook URL
                              </Button>
                              <div className="flex items-start gap-1 text-[10px] text-amber-600 dark:text-amber-400 leading-normal font-medium bg-amber-50 dark:bg-amber-500/5 p-2 rounded-lg border border-amber-100/50 dark:border-amber-500/10">
                                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                <span>
                                  For local testing, prefill with an ngrok public HTTPS forwarding
                                  address to allow Brevo to push events.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {isBrevo && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-navy-800 space-y-3">
                      <button
                        type="button"
                        onClick={() => setIsSendersExpanded(!isSendersExpanded)}
                        className="flex items-center justify-between w-full text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-brand-500 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <UserPlus size={13} className="text-brand-500" />
                          Sender Management
                        </span>
                        {isSendersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isSendersExpanded && (
                        <div className="bg-gray-50 dark:bg-navy-950 p-4 rounded-2xl border border-gray-100 dark:border-navy-800 space-y-4 animate-fadeIn">
                          <div className="flex items-center justify-between border-b border-gray-150 dark:border-navy-800 pb-2">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                              Active Senders
                            </span>
                            <button
                              type="button"
                              onClick={() => refetchSenders()}
                              className="text-[10px] text-brand-500 hover:text-brand-655 font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="Sync active senders from Brevo"
                            >
                              <RefreshCw
                                size={11}
                                className={isLoadingSenders ? 'animate-spin' : ''}
                              />{' '}
                              Sync Senders
                            </button>
                          </div>
                          {isLoadingSenders ? (
                            <div className="flex justify-center py-4">
                              <Loader2 size={16} className="animate-spin text-gray-400" />
                            </div>
                          ) : senders.length === 0 ? (
                            <p className="text-[11px] text-gray-500 text-center font-medium">
                              No senders registered yet.
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {senders.map((sender: BrevoSender) => (
                                <div
                                  key={sender.id}
                                  className="flex items-center justify-between bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-gray-100 dark:border-navy-800 text-xs"
                                >
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-gray-800 dark:text-white truncate">
                                        {sender.name}
                                      </p>
                                      {sender.active ? (
                                        <Badge
                                          color="success"
                                          className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase"
                                        >
                                          Verified
                                        </Badge>
                                      ) : (
                                        <Badge
                                          color="warning"
                                          className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase"
                                        >
                                          Pending
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                      {sender.email}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSender(sender.id)}
                                    disabled={isDeletingSender}
                                    className="p-1.5 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg transition-colors"
                                    title="Delete Sender"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <form
                            onSubmit={handleAddSender}
                            className="space-y-2 pt-2 border-t border-gray-100 dark:border-navy-800"
                          >
                            <p className="text-[10px] font-bold text-gray-400 uppercase">
                              Add New Sender
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={newSenderName}
                                onChange={(e) => setNewSenderName(e.target.value)}
                                placeholder="Sender Name"
                                required
                                className="w-full bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 px-2.5 py-1.5 rounded-xl text-xs text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 placeholder-gray-400"
                              />
                              <input
                                type="email"
                                value={newSenderEmail}
                                onChange={(e) => setNewSenderEmail(e.target.value)}
                                placeholder="Sender Email"
                                required
                                className="w-full bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 px-2.5 py-1.5 rounded-xl text-xs text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 placeholder-gray-400"
                              />
                            </div>
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="w-full justify-center text-[10px] py-1.5 h-auto font-bold mt-1"
                              disabled={
                                isCreatingSender || !newSenderEmail.trim() || !newSenderName.trim()
                              }
                              startIcon={
                                isCreatingSender ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <UserPlus size={10} />
                                )
                              }
                            >
                              Register Sender
                            </Button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status toggle & action triggers */}

                  <div className="flex items-center justify-between pt-2">
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <button
                        disabled={togglingIds.has(provider.id)}
                        onClick={() => handleToggleActive(provider)}
                        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${togglingIds.has(provider.id) ? 'opacity-60 cursor-wait' : ''} ${
                          provider.isActive ? 'bg-brand-500' : 'bg-gray-200 dark:bg-navy-700'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            provider.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span
                        className={`text-xs font-bold ${
                          provider.isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {provider.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    {/* Button actions */}
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(provider)}
                        className="p-2 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 bg-gray-50 dark:bg-navy-950 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-all"
                        title="Edit Settings"
                      >
                        <Edit size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(provider)}
                        className="p-2 text-gray-400 hover:text-error-500 bg-gray-50 dark:bg-navy-950 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-xl transition-all"
                        title="Delete Provider"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <ProviderFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editData={selectedProvider}
      />
    </div>
  );
};
