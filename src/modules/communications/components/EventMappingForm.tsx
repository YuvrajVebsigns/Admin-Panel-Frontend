'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import {
  CreateEventTemplateMappingDto,
  UpdateEventTemplateMappingDto,
  CommunicationChannel,
  MessageTemplate,
  BrevoSender,
  SchemaDiscoveryResult,
} from '../types/communication.types';
import { useEventMappings, useEventMapping } from '../hooks/useEventMappings';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import { useSystemEvents } from '../hooks/useSystemEvents';
import { useCommunicationProviders } from '../hooks/useCommunicationProviders';
import { communicationService } from '@/services/communication.service';
import { Zap, ArrowLeft, Info, Eye, X, Plus, Trash2, AlertCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// ── System Event Search Combobox ──
interface SystemEventComboboxProps {
  value: string;
  onChange: (value: string) => void;
  categories: Record<string, { key: string; value: string }[]>;
  isLoading: boolean;
}

const SystemEventCombobox: React.FC<SystemEventComboboxProps> = ({
  value,
  onChange,
  categories,
  isLoading,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCategories = useMemo(() => {
    const result: Record<string, { key: string; value: string }[]> = {};
    const query = searchTerm.toLowerCase().trim();

    for (const [category, events] of Object.entries(categories)) {
      const matched = events.filter(
        (e) =>
          e.value.toLowerCase().includes(query) ||
          e.key.toLowerCase().replace(/_/g, ' ').includes(query) ||
          category.toLowerCase().includes(query),
      );
      if (matched.length > 0) result[category] = matched;
    }

    return result;
  }, [categories, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {}, [searchTerm]);

  const handleSelect = (eventValue: string) => {
    onChange(eventValue);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const categoryLabels: Record<string, string> = {
    auth: 'Authentication',
    system_user: 'System Users',
    attendee: 'Attendees',
    event: 'Event Management',
    blog: 'Blogs',
    contact: 'Contacts',
    sponsor: 'Sponsors',
    nomination: 'Nominations',
    website: 'Websites',
    report: 'Reports',
    communication: 'Communications',
    file: 'Files',
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsDropdownOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left text-sm transition-all ${
          isDropdownOpen
            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-navy-900'
            : 'border-gray-250 dark:border-navy-800 bg-white dark:bg-navy-900'
        }`}
      >
        {value ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex-shrink-0 p-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg">
              <Zap size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{value}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 flex-1">
            Search and select a system event...
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-navy-750">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-900 border border-gray-150 dark:border-navy-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              autoComplete="off"
            />
          </div>

          <div ref={listRef} className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-brand-500" />
                <span className="text-xs text-gray-400">Loading events...</span>
              </div>
            ) : Object.keys(filteredCategories).length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-450 italic">No events found</div>
            ) : (
              <div className="py-1">
                {Object.entries(filteredCategories).map(([category, events]) => (
                  <div key={category}>
                    <div className="px-4 py-2 sticky top-0 bg-gray-55/95 dark:bg-navy-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-navy-800">
                      <span className="text-[10px] font-bold text-gray-450 dark:text-navy-400 uppercase tracking-widest">
                        {categoryLabels[category] || category}
                      </span>
                    </div>
                    {events.map((evt) => (
                      <button
                        key={evt.key}
                        type="button"
                        onClick={() => handleSelect(evt.value)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-navy-700/50 ${
                          value === evt.value
                            ? 'bg-brand-50/50 dark:bg-brand-500/5 font-semibold'
                            : ''
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${value === evt.value ? 'bg-brand-500' : 'bg-gray-300'}`}
                        />
                        <span className="text-gray-800 dark:text-gray-200 flex-1 truncate">
                          {evt.value}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Form Types ──
interface TriggerFormState {
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

interface EventMappingFormProps {
  mappingId?: string;
}

export const EventMappingForm: React.FC<EventMappingFormProps> = ({ mappingId }) => {
  const router = useRouter();
  const isEdit = !!mappingId;

  const { createMapping, isCreating, updateMapping, isUpdating } = useEventMappings();
  const { data: editData, isLoading: isLoadingMapping } = useEventMapping(mappingId || '');
  const { templates } = useMessageTemplates({ limit: 150 });
  const { categories, isLoading: isLoadingEvents } = useSystemEvents();
  const { senders } = useCommunicationProviders();

  const [schemaDiscovery, setSchemaDiscovery] = useState<SchemaDiscoveryResult[]>([]);
  const [event, setEvent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [triggers, setTriggers] = useState<TriggerFormState[]>([]);
  const [error, setError] = useState('');

  // Preview State
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const verifiedSenders = useMemo(() => {
    return senders ? senders.filter((s: BrevoSender) => s.active) : [];
  }, [senders]);

  useEffect(() => {
    communicationService
      .getSchemaDiscovery()
      .then((data) => setSchemaDiscovery(data))
      .catch(() => {});
  }, []);

  // Sync / Migrate Mapping data if Edit
  useEffect(() => {
    if (isEdit && editData) {
      setEvent(editData.event);
      setIsActive(editData.isActive);

      if (editData.triggers && editData.triggers.length > 0) {
        setTriggers(
          editData.triggers.map((t, idx) => ({
            id: `trigger_${idx}_${Date.now()}`,
            channel: t.channel,
            templateId: typeof t.templateId === 'object' ? t.templateId.id : t.templateId,
            to: t.to || '',
            cc: t.cc || '',
            bcc: t.bcc || '',
            senderEmail: t.senderEmail || '',
            senderName: t.senderName || '',
            isActive: t.isActive,
          })),
        );
      } else if (editData.templateId) {
        // Legacy conversion
        const legacyTemplate = editData.templateId as unknown as {
          id?: string;
          channel?: CommunicationChannel;
        };
        const legacyTemplateId = legacyTemplate?.id || (editData.templateId as unknown as string);
        const legacyChannel = legacyTemplate?.channel || CommunicationChannel.EMAIL;
        setTriggers([
          {
            id: `legacy_${Date.now()}`,
            channel: legacyChannel,
            templateId: legacyTemplateId,
            to: editData.to || '',
            cc: editData.cc || '',
            bcc: editData.bcc || '',
            senderEmail: editData.senderEmail || '',
            senderName: editData.senderName || '',
            isActive: true,
          },
        ]);
      } else {
        setTriggers([]);
      }
    }
  }, [isEdit, editData]);

  // Compute schemas paths for a given template's baseSchema
  const getPathsForTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl || !tpl.baseSchema) return [];

    const blacklist = [
      '_id',
      'id',
      'password',
      'token',
      'secret',
      'salt',
      'isDeleted',
      'deletedAt',
      'createdAt',
      'updatedAt',
      '__v',
    ];

    const paths: string[] = [];
    const relations = tpl.relations || [];

    const traverse = (schemaModelName: string, prefixPath: string) => {
      const depth = prefixPath ? prefixPath.split('.').length : 0;
      if (depth > 6) return;

      const schema = schemaDiscovery.find((s) => s.modelName === schemaModelName);
      if (!schema) return;

      schema.fields.forEach((f) => {
        const fullPath = prefixPath ? `${prefixPath}.${f.path}` : f.path;

        if (f.ref) {
          if (relations.includes(fullPath)) {
            traverse(f.ref, fullPath);
          }
        } else if (!blacklist.includes(f.path)) {
          paths.push(fullPath);
        }
      });
    };

    traverse(tpl.baseSchema, '');
    return paths;
  };

  const handleAddTrigger = () => {
    setTriggers((prev) => [
      ...prev,
      {
        id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

  const handleTriggerChange = (id: string, updates: Partial<TriggerFormState>) => {
    setTriggers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          // If channel changes, clear out templateId and custom recipients
          if (updates.channel) {
            updated.templateId = '';
            updated.to = '';
            updated.cc = '';
            updated.bcc = '';
            updated.senderEmail = '';
            updated.senderName = '';
          }
          return updated;
        }
        return t;
      }),
    );
  };

  // Preview Iframe effect
  const renderedPreviewHtml = useMemo(() => {
    if (!previewTemplate) return '';
    let result = previewTemplate.htmlContent || '';
    const vars = previewTemplate.variables || [];
    vars.forEach((v) => {
      const regex = new RegExp(`{{\\s*params\\.${v}\\s*}}`, 'g');
      result = result.replace(regex, previewValues[v] || `[${v}]`);
    });
    return result;
  }, [previewTemplate, previewValues]);

  useEffect(() => {
    if (previewTemplate && iframeRef.current) {
      const iframeDoc =
        iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(
          renderedPreviewHtml ||
            '<p style="font-family:sans-serif;color:#94a3b8;text-align:center;margin-top:100px;">No preview available.</p>',
        );
        iframeDoc.close();
      }
    }
  }, [previewTemplate, renderedPreviewHtml]);

  const handleOpenPreview = (tplId: string) => {
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) {
      toast.error('Template details not loaded yet.');
      return;
    }
    setPreviewTemplate(tpl);
    const mockVals: Record<string, string> = {};
    tpl.variables.forEach((v) => {
      mockVals[v] = `[Mock ${v}]`;
    });
    setPreviewValues(mockVals);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
    setPreviewValues({});
  };

  const handleCancel = () => {
    router.push('/communications/templates?tab=events');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event.trim()) {
      setError('System Event Name is required');
      return;
    }
    if (triggers.length === 0) {
      setError('Please add at least one notification trigger mapping.');
      return;
    }

    // Validate triggers
    for (let i = 0; i < triggers.length; i++) {
      const trg = triggers[i];
      if (!trg) continue;
      if (!trg.templateId) {
        setError(`Trigger #${i + 1}: Select a Message Template`);
        return;
      }
      if (!trg.to.trim()) {
        setError(`Trigger #${i + 1}: Recipient (To) field is required`);
        return;
      }
    }

    const payload: CreateEventTemplateMappingDto = {
      event: event.trim(),
      isActive,
      triggers: triggers.map((t) => ({
        channel: t.channel,
        templateId: t.templateId,
        to: t.to.trim(),
        cc: t.cc.trim() || undefined,
        bcc: t.bcc.trim() || undefined,
        senderEmail:
          t.channel === CommunicationChannel.EMAIL ? t.senderEmail.trim() || undefined : undefined,
        senderName: undefined,
        isActive: t.isActive,
      })),
    };

    try {
      if (isEdit && mappingId) {
        await updateMapping({ id: mappingId, data: payload as UpdateEventTemplateMappingDto });
      } else {
        await createMapping(payload);
      }
      router.push('/communications/templates?tab=events');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred while saving.';
      setError(errMsg);
    }
  };

  if (isEdit && isLoadingMapping) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-2xl transition-all text-gray-500 dark:text-gray-400"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? `Edit Event Mapping` : 'Create Event Mapping'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Configure multiple template notifications triggered on a parent system event.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={handleCancel}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Event Config & Triggers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parent Event Selection */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-navy-800 pb-3">
              1. Event Trigger
            </h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Parent System Event Name
              </label>
              <SystemEventCombobox
                value={event}
                onChange={(val) => {
                  setEvent(val);
                  setError('');
                }}
                categories={categories}
                isLoading={isLoadingEvents}
              />
              <p className="text-[10px] text-gray-450 mt-1.5">
                The event emitted by backend systems (e.g., <code>nomination.submitted</code>) that
                triggers the mappings.
              </p>
            </div>
          </div>

          {/* Dynamic Triggers List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide">
                2. Actions & Mapped Channels ({triggers.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleAddTrigger}
                startIcon={<Plus size={14} />}
                className="font-bold border-brand-500 text-brand-650 hover:bg-brand-50 dark:hover:bg-brand-500/10"
              >
                Add Action / Trigger
              </Button>
            </div>

            {triggers.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-gray-200 dark:border-navy-800 rounded-3xl bg-gray-55 dark:bg-navy-950/20">
                <Info className="mx-auto text-gray-300 dark:text-navy-600 mb-2" size={32} />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  No active notification triggers mapped
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Click &ldquo;Add Action / Trigger&rdquo; to automate sending emails, SMS, or Push
                  notifications when this event occurs.
                </p>
              </div>
            ) : (
              triggers.map((trigger, idx) => {
                const trgPaths = getPathsForTemplate(trigger.templateId);
                const filteredTemplates = templates.filter(
                  (t) => t.channel === trigger.channel && t.isActive,
                );

                return (
                  <div
                    key={trigger.id}
                    className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm space-y-4 relative border-l-4 border-l-brand-500 animate-fade-in"
                  >
                    {/* Trigger Card Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-850 pb-3">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                        Action #{idx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500">Active</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleTriggerChange(trigger.id, { isActive: !trigger.isActive })
                            }
                            className={`relative w-9 h-5 rounded-full transition-colors duration-250 ${
                              trigger.isActive ? 'bg-brand-500' : 'bg-gray-250 dark:bg-navy-750'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-250 ${
                                trigger.isActive ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTrigger(trigger.id)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 dark:hover:bg-red-500/10 rounded-xl transition-all"
                          title="Remove Action"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Channel & Template Rows */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Channel */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                          Channel
                        </label>
                        <select
                          value={trigger.channel}
                          onChange={(e) =>
                            handleTriggerChange(trigger.id, {
                              channel: e.target.value as CommunicationChannel,
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 cursor-pointer"
                        >
                          <option value={CommunicationChannel.EMAIL}>📧 Email</option>
                          <option value={CommunicationChannel.SMS}>💬 SMS</option>
                          <option value={CommunicationChannel.PUSH}>Bell Push</option>
                        </select>
                      </div>

                      {/* Template Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                          <span>Message Template</span>
                          {trigger.templateId && (
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(trigger.templateId)}
                              className="text-[10px] text-brand-500 hover:text-brand-600 font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Eye size={11} /> Preview
                            </button>
                          )}
                        </label>
                        <select
                          value={trigger.templateId}
                          onChange={(e) =>
                            handleTriggerChange(trigger.id, { templateId: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 cursor-pointer"
                        >
                          <option value="">— Select Active Template —</option>
                          {filteredTemplates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} (slug: {t.slug})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Dynamic Recipient Fields */}
                    {trigger.templateId && (
                      <div className="space-y-3 pt-2 bg-gray-50/50 dark:bg-navy-950/20 p-4 rounded-2xl border border-gray-100 dark:border-navy-850">
                        {/* Primary Recipient (To) */}
                        <div>
                          {(() => {
                            const isStatic =
                              trigger.to &&
                              trigger.to !== 'admin' &&
                              !trgPaths.includes(trigger.to);

                            return (
                              <>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Primary Recipient (To)
                                  </label>
                                  <div className="flex bg-gray-100 dark:bg-navy-950 p-0.5 rounded-lg border border-gray-200/50 dark:border-navy-800">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleTriggerChange(trigger.id, { to: '' });
                                      }}
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                                        !isStatic
                                          ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-sm'
                                          : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                    >
                                      Dynamic Field
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const defaultVal =
                                          trigger.channel === CommunicationChannel.EMAIL
                                            ? 'custom@example.com'
                                            : 'static-recipient';
                                        handleTriggerChange(trigger.id, { to: defaultVal });
                                      }}
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                                        isStatic
                                          ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-brand-400 shadow-sm'
                                          : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                    >
                                      Custom Static
                                    </button>
                                  </div>
                                </div>

                                {isStatic ? (
                                  <input
                                    type="text"
                                    value={trigger.to}
                                    onChange={(e) =>
                                      handleTriggerChange(trigger.id, { to: e.target.value })
                                    }
                                    placeholder={
                                      trigger.channel === CommunicationChannel.EMAIL
                                        ? 'e.g. info@vebsigns.com'
                                        : 'e.g. static-value'
                                    }
                                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 font-mono"
                                  />
                                ) : (
                                  <select
                                    value={trigger.to}
                                    onChange={(e) =>
                                      handleTriggerChange(trigger.id, { to: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 cursor-pointer"
                                  >
                                    <option value="">— Select Recipient —</option>
                                    <option value="admin">
                                      System Administrator / Backup Email (admin)
                                    </option>
                                    {(() => {
                                      const options: { value: string; label: string }[] = [];
                                      if (trigger.channel === CommunicationChannel.EMAIL) {
                                        trgPaths
                                          .filter((p) => p.toLowerCase().includes('email'))
                                          .forEach((p) => {
                                            options.push({
                                              value: p,
                                              label: `${p} (Dynamic Email)`,
                                            });
                                          });
                                      } else if (trigger.channel === CommunicationChannel.SMS) {
                                        trgPaths
                                          .filter(
                                            (p) =>
                                              p.toLowerCase().includes('phone') ||
                                              p.toLowerCase().includes('mobile'),
                                          )
                                          .forEach((p) => {
                                            options.push({
                                              value: p,
                                              label: `${p} (Dynamic Phone)`,
                                            });
                                          });
                                      } else {
                                        trgPaths.forEach((p) => {
                                          options.push({ value: p, label: `${p} (Dynamic Field)` });
                                        });
                                      }
                                      return options
                                        .filter((opt) => opt.value !== 'admin')
                                        .map((opt) => (
                                          <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </option>
                                        ));
                                    })()}
                                  </select>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* CC & BCC (Email only) */}
                        {trigger.channel === CommunicationChannel.EMAIL && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 flex items-center justify-between">
                                <span>CC Recipients</span>
                              </label>
                              <input
                                type="text"
                                value={trigger.cc}
                                onChange={(e) =>
                                  handleTriggerChange(trigger.id, { cc: e.target.value })
                                }
                                placeholder="Backup email address or field path"
                                className="w-full px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 font-mono"
                              />
                              {trgPaths.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {trgPaths
                                    .filter((p) => p.toLowerCase().includes('email'))
                                    .map((p) => (
                                      <button
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                          const current = trigger.cc ? `${trigger.cc}, ${p}` : p;
                                          handleTriggerChange(trigger.id, { cc: current });
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-navy-800 dark:text-navy-300 font-mono text-[8px] transition-all"
                                      >
                                        + {p}
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 flex items-center justify-between">
                                <span>BCC Recipients</span>
                              </label>
                              <input
                                type="text"
                                value={trigger.bcc}
                                onChange={(e) =>
                                  handleTriggerChange(trigger.id, { bcc: e.target.value })
                                }
                                placeholder="Static archive or backup address"
                                className="w-full px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 font-mono"
                              />
                              {trgPaths.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {trgPaths
                                    .filter((p) => p.toLowerCase().includes('email'))
                                    .map((p) => (
                                      <button
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                          const current = trigger.bcc ? `${trigger.bcc}, ${p}` : p;
                                          handleTriggerChange(trigger.id, { bcc: current });
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-navy-800 dark:text-navy-300 font-mono text-[8px] transition-all"
                                      >
                                        + {p}
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Provider sender configuration (Email only) */}
                        {trigger.channel === CommunicationChannel.EMAIL && (
                          <div className="pt-1 space-y-2">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                Sender Email
                              </label>
                              <select
                                value={trigger.senderEmail}
                                onChange={(e) =>
                                  handleTriggerChange(trigger.id, { senderEmail: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 cursor-pointer"
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
                              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                Brand Sender Name
                              </label>
                              <input
                                type="text"
                                value="Provider default"
                                readOnly
                                disabled
                                className="w-full px-4 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 text-xs bg-gray-50 dark:bg-navy-950 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              />
                              <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                                The From name stays fixed to the brand identity and not the contact
                                name.
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

        {/* Sidebar Info & Controls */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-navy-800 pb-3">
              Trigger Mappings Settings
            </h3>

            {/* Parent Active Status toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-55 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800">
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-white">Mapping Status</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Activate or deactivate this event mapping rules.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 ${
                  isActive ? 'bg-brand-500' : 'bg-gray-300 dark:bg-navy-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Instructions info */}
            <div className="p-4 bg-blue-50/50 dark:bg-brand-500/5 border border-blue-100 dark:border-brand-500/10 rounded-2xl space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-brand-400">
                <HelpCircle size={14} />
                <span>Multi-Trigger Resolution</span>
              </div>
              <p>When a system event occurs:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                <li>The system will evaluate all actions listed on the left.</li>
                <li>
                  Each active action channel resolves its recipient dynamically against the event
                  data context.
                </li>
                <li>Separate templates will be prepared and delivered concurrently.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal Overlay */}
      {previewTemplate && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl border border-gray-150 dark:border-navy-800 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-150 dark:border-navy-800 flex items-center justify-between bg-gray-50 dark:bg-navy-950">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye size={16} className="text-brand-500" />
                  <span>Previewing Message Layout: {previewTemplate.name}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClosePreview}
                className="p-2 hover:bg-gray-200 dark:hover:bg-navy-850 rounded-xl transition-all text-gray-500 dark:text-gray-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Mock variables sidepanel */}
              {previewTemplate.variables.length > 0 && (
                <div className="w-72 border-r border-gray-150 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950/20 p-5 overflow-y-auto space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">
                    Enter Mock Variables Data
                  </h4>
                  <div className="space-y-3">
                    {previewTemplate.variables.map((v) => (
                      <div key={v}>
                        <label className="block text-[10px] font-semibold text-gray-650 dark:text-gray-300 mb-1 font-mono">
                          {v}
                        </label>
                        <input
                          type="text"
                          value={previewValues[v] || ''}
                          onChange={(e) =>
                            setPreviewValues((prev) => ({ ...prev, [v]: e.target.value }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-navy-850 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Render Iframe */}
              <div className="flex-1 bg-white p-4 relative">
                {previewTemplate.channel === CommunicationChannel.EMAIL ? (
                  <iframe
                    ref={iframeRef}
                    title="Live Render Output"
                    className="w-full h-full border border-gray-150 rounded-2xl shadow-inner bg-white"
                  />
                ) : (
                  <div className="max-w-md mx-auto h-full border border-gray-200 rounded-3xl shadow-lg bg-gray-55 p-4 relative overflow-y-auto">
                    <div className="bg-brand-500 text-white text-xs px-3 py-1.5 rounded-t-2xl font-bold flex items-center justify-between">
                      <span>SMS / PUSH Message Preview</span>
                    </div>
                    <div className="p-4 bg-white border border-gray-100 rounded-b-2xl text-xs text-gray-805 font-medium leading-relaxed whitespace-pre-wrap">
                      {previewTemplate.textContent || 'No plain text content defined.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
