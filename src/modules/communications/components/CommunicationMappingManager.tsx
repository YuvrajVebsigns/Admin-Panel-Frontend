'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import {
  CreateEventTemplateMappingDto,
  UpdateEventTemplateMappingDto,
  CommunicationChannel,
  BrevoSender,
} from '../types/communication.types';
import { useEventMappings, useEventMapping } from '../hooks/useEventMappings';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import { useSystemEvents } from '../hooks/useSystemEvents';
import { useCommunicationProviders } from '../hooks/useCommunicationProviders';
import { VariableTokenSidebar } from './VariableTokenSidebar';
import { TargetPathSelector } from './TargetPathSelector';
import {
  Zap,
  ArrowLeft,
  Info,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Radio,
  Clock,
  Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Types ──
interface TriggerRow {
  id: string;
  channel: CommunicationChannel;
  templateId: string;
  to: string;
  cc: string;
  bcc: string;
  senderEmail: string;
  senderName: string;
  isActive: boolean;
}

type TriggerMode = 'system_event' | 'scheduled';

interface Props {
  mappingId?: string;
}

export const CommunicationMappingManager: React.FC<Props> = ({ mappingId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams?.get('id') || searchParams?.get('mappingId') || '';
  const resolvedMappingId = mappingId || queryId;
  const isEdit = !!resolvedMappingId;

  const { createMapping, isCreating, updateMapping, isUpdating } = useEventMappings();
  const { data: editData, isLoading: isLoadingMapping } = useEventMapping(resolvedMappingId);
  const { templates } = useMessageTemplates({ limit: 150 });
  const { categories } = useSystemEvents();
  const { senders } = useCommunicationProviders();

  const [triggerMode, setTriggerMode] = useState<TriggerMode>('system_event');
  const [event, setEvent] = useState('');
  const [templateSlug, setTemplateSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [triggers, setTriggers] = useState<TriggerRow[]>([]);
  const [error, setError] = useState('');

  // Track the last-focused text input for token insertion
  const lastFocusedRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const verifiedSenders = useMemo(() => {
    return senders ? senders.filter((s: BrevoSender) => s.active) : [];
  }, [senders]);

  // Populate form on edit
  useEffect(() => {
    if (!isEdit || !editData) return;
    setEvent(editData.event);
    setIsActive(editData.isActive);

    if (editData.triggers?.length) {
      setTriggers(
        editData.triggers.map((t, idx) => ({
          id: `trigger_${idx}_${Date.now()}`,
          channel: t.channel,
          templateId:
            typeof t.templateId === 'object'
              ? (t.templateId as unknown as { id: string }).id
              : (t.templateId as string),
          to: t.to || '',
          cc: t.cc || '',
          bcc: t.bcc || '',
          senderEmail: t.senderEmail || '',
          senderName: t.senderName || '',
          isActive: t.isActive,
        })),
      );
    } else if (editData.templateId) {
      const legacy = editData.templateId as unknown as {
        id?: string;
        channel?: CommunicationChannel;
      };
      setTriggers([
        {
          id: `legacy_${Date.now()}`,
          channel: legacy?.channel || CommunicationChannel.EMAIL,
          templateId: legacy?.id || (editData.templateId as unknown as string),
          to: editData.to || '',
          cc: editData.cc || '',
          bcc: editData.bcc || '',
          senderEmail: editData.senderEmail || '',
          senderName: editData.senderName || '',
          isActive: true,
        },
      ]);
    }
  }, [isEdit, editData]);

  const handleAddTrigger = () => {
    setTriggers((prev) => [
      ...prev,
      {
        id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        channel: CommunicationChannel.EMAIL,
        templateId: '',
        to: '',
        cc: '',
        bcc: '',
        senderEmail: '',
        senderName: '',
        isActive: true,
      },
    ]);
  };

  const handleRemoveTrigger = (id: string) => {
    setTriggers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTriggerChange = (id: string, updates: Partial<TriggerRow>) => {
    setTriggers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        if (updates.channel) {
          updated.templateId = '';
          updated.to = '';
          updated.cc = '';
          updated.bcc = '';
          updated.senderEmail = '';
          updated.senderName = '';
        }
        return updated;
      }),
    );
  };

  // Token insertion callback
  const handleInsertToken = useCallback((token: string) => {
    const el = lastFocusedRef.current;
    if (!el) {
      toast('Click an input field first, then select a token.', { icon: '💡' });
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.substring(0, start);
    const after = el.value.substring(end);
    const nativeInputValueSetter =
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
      Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, before + token + after);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    el.focus();
    const newPos = start + token.length;
    el.setSelectionRange(newPos, newPos);
    toast.success(`Inserted: ${token}`);
  }, []);

  const trackFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    lastFocusedRef.current = e.target;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (triggerMode === 'system_event' && !event.trim()) {
      setError('System Event Name is required');
      return;
    }
    if (triggers.length === 0) {
      setError('Add at least one output channel trigger.');
      return;
    }
    for (let i = 0; i < triggers.length; i++) {
      const trg = triggers[i]!;
      if (!trg.templateId) {
        setError(`Trigger #${i + 1}: Select a Message Template`);
        return;
      }
      if (!trg.to.trim()) {
        setError(`Trigger #${i + 1}: Recipient (To) is required`);
        return;
      }
    }

    const payload: CreateEventTemplateMappingDto = {
      event: triggerMode === 'system_event' ? event.trim() : `slug:${templateSlug}`,
      isActive,
      triggers: triggers.map((t) => ({
        channel: t.channel,
        templateId: t.templateId,
        to: t.to.trim(),
        cc: t.cc.trim() || undefined,
        bcc: t.bcc.trim() || undefined,
        senderEmail:
          t.channel === CommunicationChannel.EMAIL ? t.senderEmail.trim() || undefined : undefined,
        senderName:
          t.channel === CommunicationChannel.EMAIL ? t.senderName.trim() || undefined : undefined,
        isActive: t.isActive,
      })),
    };

    try {
      if (isEdit && resolvedMappingId) {
        await updateMapping({
          id: resolvedMappingId,
          data: payload as UpdateEventTemplateMappingDto,
        });
      } else {
        await createMapping(payload);
      }
      router.push('/communications/templates?tab=events');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    }
  };

  if (isEdit && isLoadingMapping) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/communications/templates?tab=events')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-2xl transition-all text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Communication Mapping' : 'Create Communication Mapping'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Configure triggers, channels, and dynamic recipients for automated communications.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push('/communications/templates?tab=events')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="shadow-lg shadow-brand-500/20 px-6 font-bold"
            isLoading={isCreating || isUpdating}
          >
            {isEdit ? 'Save Changes' : 'Create Mapping'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-650 dark:text-red-400 rounded-2xl flex items-center gap-2 text-sm font-bold border border-red-100 dark:border-red-500/20">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Panel (75%) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Trigger Mode Switch */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-navy-800 pb-3">
              1. Trigger Configuration
            </h3>

            {/* Toggle */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-navy-950 rounded-2xl border border-gray-200/50 dark:border-navy-800 w-fit">
              <button
                type="button"
                onClick={() => setTriggerMode('system_event')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  triggerMode === 'system_event'
                    ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Radio size={13} /> System Event Driven
              </button>
              <button
                type="button"
                onClick={() => setTriggerMode('scheduled')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  triggerMode === 'scheduled'
                    ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Clock size={13} /> Scheduled / On-Demand
              </button>
            </div>

            {/* Event Selector or Slug Display */}
            {triggerMode === 'system_event' ? (
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Parent System Event Name
                </label>
                <div className="relative">
                  <Zap
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500"
                  />
                  <select
                    value={event}
                    onChange={(e) => {
                      setEvent(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-navy-800 text-sm bg-white dark:bg-navy-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">— Select System Event —</option>
                    {Object.entries(categories).map(([cat, events]) => (
                      <optgroup key={cat} label={cat.replace(/_/g, ' ').toUpperCase()}>
                        {events.map((evt) => (
                          <option key={evt.key} value={evt.value}>
                            {evt.value}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Template Slug Key
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-200 dark:border-navy-800">
                    <Hash size={14} className="text-brand-500" />
                    <input
                      type="text"
                      value={templateSlug}
                      onChange={(e) => setTemplateSlug(e.target.value)}
                      placeholder="e.g. welcome-digest"
                      onFocus={trackFocus}
                      className="flex-1 bg-transparent text-sm font-mono text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="p-3 bg-amber-50/60 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-2xl flex items-start gap-2">
                  <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    This template context operates outside the standard application lifecycle.
                    Executions are processed via system schedulers or administrative bulk-send
                    commands.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Trigger Matrix */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide">
                2. Output Channels ({triggers.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleAddTrigger}
                startIcon={<Plus size={14} />}
                className="font-bold border-brand-500 text-brand-650 hover:bg-brand-50 dark:hover:bg-brand-500/10"
              >
                Add Output Channel
              </Button>
            </div>

            {triggers.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-gray-200 dark:border-navy-800 rounded-3xl bg-gray-55 dark:bg-navy-950/20">
                <Info className="mx-auto text-gray-300 dark:text-navy-600 mb-2" size={32} />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  No output channels configured
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Click &ldquo;Add Output Channel&rdquo; to configure email, SMS, or push delivery
                  triggers.
                </p>
              </div>
            ) : (
              triggers.map((trigger, idx) => {
                const filteredTemplates = templates.filter(
                  (t) => t.channel === trigger.channel && t.isActive,
                );
                const selectedTemplate = templates.find((t) => t.id === trigger.templateId);

                return (
                  <div
                    key={trigger.id}
                    className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm space-y-4 relative border-l-4 border-l-brand-500 animate-fade-in"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-850 pb-3">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                        Channel #{idx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500">Active</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleTriggerChange(trigger.id, { isActive: !trigger.isActive })
                            }
                            className={`relative w-9 h-5 rounded-full transition-colors ${trigger.isActive ? 'bg-brand-500' : 'bg-gray-250 dark:bg-navy-750'}`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${trigger.isActive ? 'translate-x-4' : 'translate-x-0'}`}
                            />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTrigger(trigger.id)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 dark:hover:bg-red-500/10 rounded-xl transition-all"
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Channel & Template */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-450 uppercase tracking-wide mb-1.5">
                          Delivery Channel
                        </label>
                        <select
                          value={trigger.channel}
                          onChange={(e) =>
                            handleTriggerChange(trigger.id, {
                              channel: e.target.value as CommunicationChannel,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs bg-white dark:bg-navy-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                        >
                          <option value={CommunicationChannel.EMAIL}>📧 Email</option>
                          <option value={CommunicationChannel.SMS}>💬 SMS</option>
                          <option value={CommunicationChannel.PUSH}>🔔 Push</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-450 uppercase tracking-wide mb-1.5">
                          Message Template
                        </label>
                        <select
                          value={trigger.templateId}
                          onChange={(e) =>
                            handleTriggerChange(trigger.id, { templateId: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs bg-white dark:bg-navy-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                        >
                          <option value="">— Select Template —</option>
                          {filteredTemplates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.slug})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Recipient & Sender Overrides */}
                    {trigger.templateId && (
                      <div className="space-y-3 pt-2 bg-gray-50/50 dark:bg-navy-950/20 p-4 rounded-2xl border border-gray-100 dark:border-navy-850">
                        {/* Dynamic Destination (to) */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Dynamic Destination (To)
                          </label>
                          <TargetPathSelector
                            value={trigger.to}
                            onChange={(val) => handleTriggerChange(trigger.id, { to: val })}
                            modelName={selectedTemplate?.baseSchema}
                            channel={trigger.channel}
                          />
                        </div>

                        {/* CC & BCC (Email) */}
                        {trigger.channel === CommunicationChannel.EMAIL && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                                CC
                              </label>
                              <input
                                type="text"
                                value={trigger.cc}
                                onFocus={trackFocus}
                                onChange={(e) =>
                                  handleTriggerChange(trigger.id, { cc: e.target.value })
                                }
                                placeholder="CC email or variable path"
                                className="w-full px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs bg-white dark:bg-navy-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                                BCC
                              </label>
                              <input
                                type="text"
                                value={trigger.bcc}
                                onFocus={trackFocus}
                                onChange={(e) =>
                                  handleTriggerChange(trigger.id, { bcc: e.target.value })
                                }
                                placeholder="BCC email address"
                                className="w-full px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs bg-white dark:bg-navy-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
                              />
                            </div>
                          </div>
                        )}

                        {/* Sender Overrides (Email) */}
                        {trigger.channel === CommunicationChannel.EMAIL && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                                Sender Email Override
                              </label>
                              <select
                                value={trigger.senderEmail}
                                onChange={(e) =>
                                  handleTriggerChange(trigger.id, { senderEmail: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs bg-white dark:bg-navy-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                              >
                                <option value="">Default Provider Email</option>
                                {verifiedSenders.map((s) => (
                                  <option key={s.id} value={s.email}>
                                    {s.name} ({s.email})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                                Sender Name Override
                              </label>
                              <input
                                type="text"
                                value={trigger.senderName}
                                onFocus={trackFocus}
                                onChange={(e) =>
                                  handleTriggerChange(trigger.id, { senderName: e.target.value })
                                }
                                placeholder="e.g. Core Media Support"
                                className="w-full px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs bg-white dark:bg-navy-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
                              />
                              <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                                Optional. Leave empty to use provider default.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar (25%) */}
        <div className="xl:col-span-1 space-y-6">
          {/* Settings Card */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-navy-800 pb-3">
              Mapping Settings
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-55 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800">
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-white">Mapping Status</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Activate or deactivate this mapping.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${isActive ? 'bg-brand-500' : 'bg-gray-300 dark:bg-navy-700'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <div className="p-4 bg-blue-50/50 dark:bg-brand-500/5 border border-blue-100 dark:border-brand-500/10 rounded-2xl space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-brand-400">
                <HelpCircle size={14} />
                <span>Multi-Channel Resolution</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                <li>Each active channel resolves recipients dynamically.</li>
                <li>Separate templates are prepared and delivered concurrently.</li>
                <li>Array targets fan out individual dispatches automatically.</li>
              </ul>
            </div>
          </div>

          {/* Token Sidebar */}
          <div className="sticky top-6">
            <VariableTokenSidebar onSelectToken={handleInsertToken} />
          </div>
        </div>
      </div>
    </form>
  );
};
