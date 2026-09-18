'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEventMappings } from '../hooks/useEventMappings';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import {
  EventTemplateMapping,
  MessageTemplate,
  CommunicationChannel,
  EventMappingTrigger,
} from '../types/communication.types';
import { useAuthStore } from '@/store/auth.store';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import {
  Edit,
  Trash2,
  Plus,
  ToggleLeft,
  Zap,
  Eye,
  X,
  Mail,
  MessageSquare,
  Bell,
  Globe,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { communicationService } from '@/services/communication.service';

export const EventMappingsTab: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthorized = ['super_admin', 'admin'].includes(user?.role?.roleKey || '');

  const [selectedWebsiteFilter, setSelectedWebsiteFilter] = useState<string>('all');
  const { mappings, isLoading, deleteMapping } = useEventMappings();
  const { templates } = useMessageTemplates({ limit: 150 });
  const { websites = [] } = useWebsites({ limit: 100 });

  // View Details Modal State
  const [selectedMapping, setSelectedMapping] = useState<EventTemplateMapping | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Template Preview States within View Modal
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleOpenViewModal = (mapping: EventTemplateMapping) => {
    setSelectedMapping(mapping);
    setIsViewOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewOpen(false);
    setSelectedMapping(null);
    setPreviewTemplate(null);
    setPreviewValues({});
  };

  const handleOpenTemplatePreview = (tplId: string) => {
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) {
      toast.error('Template details could not be found.');
      return;
    }
    setPreviewTemplate(tpl);
    const mockVals: Record<string, string> = {};
    tpl.variables?.forEach((v) => {
      mockVals[v] = `[Mock ${v}]`;
    });
    setPreviewValues(mockVals);
  };

  // Preview live render html
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
        iframeDoc.close;
      }
    }
  }, [previewTemplate, renderedPreviewHtml]);

  const handleDelete = async (mapping: EventTemplateMapping) => {
    if (
      window.confirm(`Are you sure you want to delete the event mapping for "${mapping.event}"?`)
    ) {
      try {
        await deleteMapping(mapping.id);
      } catch (err) {
        // Error toast shown by hook mutation
      }
    }
  };

  const handleToggleMappingActive = async (mapping: EventTemplateMapping) => {
    if (!isAuthorized) return;
    try {
      await communicationService.updateEventMapping(mapping.id, {
        isActive: !mapping.isActive,
      });
      toast.success(`Mapping status updated successfully`);
      router.refresh();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to update mapping status.';
      toast.error(errMsg);
    }
  };

  const handleToggleTriggerActive = async (mapping: EventTemplateMapping, triggerIndex: number) => {
    if (!isAuthorized || !mapping.triggers) return;
    try {
      const updatedTriggers = mapping.triggers.map((t, idx) => {
        if (idx === triggerIndex) {
          return {
            ...t,
            templateId:
              typeof t.templateId === 'object'
                ? (t.templateId as unknown as { id: string }).id
                : t.templateId,
            isActive: !t.isActive,
          };
        }
        return {
          ...t,
          templateId:
            typeof t.templateId === 'object'
              ? (t.templateId as unknown as { id: string }).id
              : t.templateId,
        };
      });

      const updated = await communicationService.updateEventMapping(mapping.id, {
        triggers: updatedTriggers as unknown as EventMappingTrigger[],
      });

      setSelectedMapping(updated);
      toast.success(`Action trigger status updated`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to update trigger status.';
      toast.error(errMsg);
    }
  };

  // Filter mappings based on selected website filter
  const filteredMappings = useMemo(() => {
    if (selectedWebsiteFilter === 'all') return mappings;
    if (selectedWebsiteFilter === 'global') {
      return mappings.filter((m) => m.triggers?.some((t) => !t.websiteId));
    }
    return mappings.filter((m) =>
      m.triggers?.some((t) => {
        const pop =
          typeof t.websiteId === 'object' && t.websiteId
            ? (t.websiteId as unknown as { _id?: string; id?: string })
            : null;
        const wId = pop?._id || pop?.id || (t.websiteId as string);
        return String(wId) === selectedWebsiteFilter;
      }),
    );
  }, [mappings, selectedWebsiteFilter]);

  const columns: Column<EventTemplateMapping>[] = [
    {
      header: 'System Event Name',
      accessor: (m) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white text-sm">{m.event}</span>
          <span className="text-[10px] text-gray-450 dark:text-navy-400 font-mono mt-0.5">
            {m.event.split('.')[0]} module trigger
          </span>
        </div>
      ),
    },
    {
      header: 'Website Scopes & Triggers',
      accessor: (m) => {
        const triggers = m.triggers || [];

        // Group triggers by website
        const websiteMap = new Map<
          string,
          { count: number; name: string; domain?: string; isGlobal: boolean }
        >();

        triggers.forEach((t) => {
          let wId = '';
          let wName = 'Global Default';
          let wDomain = '';
          let isGlobal = true;

          if (t.websiteId) {
            if (typeof t.websiteId === 'object') {
              const pop = t.websiteId as unknown as {
                _id?: string;
                id?: string;
                name?: string;
                domain?: string;
              };
              wId = String(pop._id || pop.id || '');
              wName = pop.name || 'Website';
              wDomain = pop.domain || '';
            } else {
              wId = String(t.websiteId);
              const found = websites.find((w) => w.id === wId);
              if (found) {
                wName = found.name;
                wDomain = found.domain;
              }
            }
            isGlobal = false;
          } else {
            wId = 'global';
          }

          const existing = websiteMap.get(wId) || {
            count: 0,
            name: wName,
            domain: wDomain,
            isGlobal,
          };
          existing.count += 1;
          websiteMap.set(wId, existing);
        });

        const groups = Array.from(websiteMap.values());

        return (
          <div className="flex flex-wrap items-center gap-1.5 max-w-md">
            {groups.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No triggers</span>
            ) : (
              groups.map((g, idx) => (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                    g.isGlobal
                      ? 'bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-navy-700'
                      : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/20'
                  }`}
                >
                  <Globe
                    size={11}
                    className={g.isGlobal ? 'text-gray-500' : 'text-blue-600 dark:text-blue-400'}
                  />
                  <span>{g.name}</span>
                  <span className="px-1 py-0.2 bg-white/80 dark:bg-navy-900 rounded text-[9px] font-mono">
                    {g.count}
                  </span>
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      header: 'Channels',
      accessor: (m) => {
        const channelTypes = m.triggers?.map((t) => t.channel) || [];
        const hasEmail = channelTypes.includes(CommunicationChannel.EMAIL);
        const hasSms = channelTypes.includes(CommunicationChannel.SMS);
        const hasPush = channelTypes.includes(CommunicationChannel.PUSH);

        return (
          <div className="flex items-center gap-2 text-gray-500 dark:text-navy-400">
            {hasEmail && (
              <span className="p-1 bg-gray-50 dark:bg-navy-900 rounded-md" title="Email">
                <Mail size={13} className="text-blue-500" />
              </span>
            )}
            {hasSms && (
              <span className="p-1 bg-gray-50 dark:bg-navy-900 rounded-md" title="SMS">
                <MessageSquare size={13} className="text-green-500" />
              </span>
            )}
            {hasPush && (
              <span className="p-1 bg-gray-50 dark:bg-navy-900 rounded-md" title="Push">
                <Bell size={13} className="text-amber-500" />
              </span>
            )}
            {!hasEmail && !hasSms && !hasPush && <span className="text-xs text-gray-400">—</span>}
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (m) => (
        <button
          onClick={() => handleToggleMappingActive(m)}
          disabled={!isAuthorized}
          className={`cursor-pointer ${!isAuthorized ? 'opacity-80 pointer-events-none' : ''}`}
        >
          <Badge
            color={m.isActive ? 'success' : 'warning'}
            className="font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg border-none shadow-sm"
          >
            {m.isActive ? 'Active' : 'Disabled'}
          </Badge>
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (m) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenViewModal(m)}
            className="p-1.5 text-gray-400 hover:text-brand-500 bg-gray-50 dark:bg-navy-950 hover:bg-brand-55 rounded-lg transition-all cursor-pointer"
            title="View Details"
          >
            <Eye size={14} />
          </button>
          {isAuthorized ? (
            <>
              <button
                onClick={() => router.push(`/communications/mappings/${m.id}`)}
                className="p-1.5 text-gray-400 hover:text-brand-500 bg-gray-50 dark:bg-navy-950 hover:bg-brand-55 rounded-lg transition-all cursor-pointer"
                title="Edit Mapping"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => handleDelete(m)}
                className="p-1.5 text-gray-400 hover:text-error-500 bg-gray-50 dark:bg-navy-950 hover:bg-error-50 rounded-lg transition-all cursor-pointer"
                title="Delete Mapping"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400">Read Only</span>
          )}
        </div>
      ),
    },
  ];

  // Helper to group selected mapping triggers by website for details modal
  const groupedModalTriggers = useMemo(() => {
    if (!selectedMapping?.triggers) return [];

    const map = new Map<
      string,
      {
        key: string;
        name: string;
        domain?: string;
        allowedDomains?: string[];
        isGlobal: boolean;
        items: { trigger: EventMappingTrigger; originalIndex: number }[];
      }
    >();

    selectedMapping.triggers.forEach((trigger, originalIndex) => {
      let key = 'global';
      let name = 'Global Default (All Websites)';
      let domain = '';
      let allowedDomains: string[] = [];
      let isGlobal = true;

      if (trigger.websiteId) {
        if (typeof trigger.websiteId === 'object') {
          const pop = trigger.websiteId as unknown as {
            _id?: string;
            id?: string;
            name?: string;
            domain?: string;
            allowedDomains?: string[];
          };
          key = String(pop._id || pop.id || '');
          name = pop.name || 'Website';
          domain = pop.domain || '';
          allowedDomains = pop.allowedDomains || [];
        } else {
          key = String(trigger.websiteId);
          const found = websites.find((w) => w.id === key);
          if (found) {
            name = found.name;
            domain = found.domain;
            allowedDomains = found.allowedDomains || [];
          }
        }
        isGlobal = false;
      }

      if (!map.has(key)) {
        map.set(key, { key, name, domain, allowedDomains, isGlobal, items: [] });
      }
      map.get(key)!.items.push({ trigger, originalIndex });
    });

    return Array.from(map.values());
  }, [selectedMapping, websites]);

  return (
    <div className="space-y-6">
      {/* Header & Website Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
            Event Mappings
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Map system events to website-specific and global communication action templates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Website Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-2xl px-3 py-1.5 shadow-sm">
            <Filter size={13} className="text-gray-400" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Website:
            </span>
            <select
              value={selectedWebsiteFilter}
              onChange={(e) => setSelectedWebsiteFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-800 dark:text-white focus:outline-none cursor-pointer pr-2"
            >
              <option value="all">All Mappings ({mappings.length})</option>
              <option value="global">🌐 Global Defaults Only</option>
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  🏷️ {w.name} ({w.domain})
                </option>
              ))}
            </select>
          </div>

          {isAuthorized && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/communications/mappings/create')}
              startIcon={<Plus size={14} />}
            >
              Add Event Mapping
            </Button>
          )}
        </div>
      </div>

      {filteredMappings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-navy-950 border border-dashed border-gray-200 dark:border-navy-800 rounded-3xl text-center">
          <ToggleLeft size={40} className="text-gray-400 mb-3" />
          <p className="text-sm font-bold text-gray-800 dark:text-white">
            {selectedWebsiteFilter !== 'all' ? 'No Mappings Matching Filter' : 'No Event Mappings'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            {selectedWebsiteFilter !== 'all'
              ? 'No event mappings have triggers configured for the selected website scope.'
              : 'Configure parent event triggers to automate notifications setup.'}
          </p>
          {selectedWebsiteFilter !== 'all' ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setSelectedWebsiteFilter('all')}
            >
              Clear Filter
            </Button>
          ) : (
            isAuthorized && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => router.push('/communications/mappings/create')}
              >
                Create Mapping
              </Button>
            )
          )}
        </div>
      ) : (
        <DataTable data={filteredMappings} columns={columns} isLoading={isLoading} />
      )}

      {/* Details View Modal */}
      {selectedMapping && (
        <Modal
          isOpen={isViewOpen}
          onClose={handleCloseViewModal}
          title={`Event Mapping Details`}
          className="!max-w-4xl !overflow-visible"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-650 dark:text-brand-400 rounded-xl">
                  <Zap size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                    {selectedMapping.event}
                  </h4>
                  <p className="text-[11px] text-gray-550">Emitted event identifier</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Mapping Status:</span>
                <button
                  onClick={() => handleToggleMappingActive(selectedMapping)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-250 ${
                    selectedMapping.isActive ? 'bg-brand-500' : 'bg-gray-250 dark:bg-navy-750'
                  }`}
                  disabled={!isAuthorized}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-250 ${
                      selectedMapping.isActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-[11px] font-bold text-gray-450 uppercase tracking-widest">
                  Website-Segregated Triggers ({selectedMapping.triggers?.length || 0} Total
                  Actions)
                </h5>
              </div>

              {!selectedMapping.triggers || selectedMapping.triggers.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No triggers defined for this event mapping.
                </p>
              ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {groupedModalTriggers.map((group) => (
                    <div
                      key={group.key}
                      className={`rounded-2xl border p-4 space-y-3 ${
                        group.isGlobal
                          ? 'bg-gray-50/70 dark:bg-navy-950/60 border-gray-200 dark:border-navy-800'
                          : 'bg-blue-50/30 dark:bg-navy-950/60 border-blue-200/70 dark:border-blue-500/20'
                      }`}
                    >
                      {/* Website Group Header */}
                      <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-navy-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Globe
                            size={14}
                            className={
                              group.isGlobal ? 'text-gray-500' : 'text-blue-600 dark:text-blue-400'
                            }
                          />
                          <span
                            className={`text-xs font-bold ${
                              group.isGlobal
                                ? 'text-gray-800 dark:text-gray-200'
                                : 'text-blue-800 dark:text-blue-300'
                            }`}
                          >
                            {group.name}
                          </span>
                          {group.domain && (
                            <span className="text-[11px] font-mono text-gray-500 dark:text-navy-400">
                              ({group.domain})
                            </span>
                          )}
                        </div>
                        <Badge
                          color={group.isGlobal ? 'light' : 'info'}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                        >
                          {group.items.length} Trigger{group.items.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>

                      {/* Triggers in this group */}
                      <div className="space-y-2.5">
                        {group.items.map(({ trigger, originalIndex }) => {
                          const templateName =
                            typeof trigger.templateId === 'object'
                              ? (trigger.templateId as MessageTemplate).name
                              : templates.find((t) => t.id === trigger.templateId)?.name ||
                                'Unknown Template';

                          const templateSlug =
                            typeof trigger.templateId === 'object'
                              ? (trigger.templateId as MessageTemplate).slug
                              : templates.find((t) => t.id === trigger.templateId)?.slug || '';

                          return (
                            <div
                              key={originalIndex}
                              className="p-3.5 bg-white dark:bg-navy-900 border border-gray-150 dark:border-navy-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                            >
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Action #{originalIndex + 1}:
                                  </span>
                                  <Badge
                                    color="info"
                                    className="text-[9px] rounded font-bold px-1.5 py-0.5 uppercase"
                                  >
                                    {trigger.channel}
                                  </Badge>
                                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                    {templateName}
                                  </span>
                                  {templateSlug && (
                                    <span className="text-[10px] text-gray-400 dark:text-navy-450 font-mono">
                                      ({templateSlug})
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono space-y-0.5">
                                  <div>
                                    <span className="font-bold text-gray-450">To:</span>{' '}
                                    {trigger.to}
                                  </div>
                                  {trigger.cc && (
                                    <div>
                                      <span className="font-bold text-gray-450">CC:</span>{' '}
                                      {trigger.cc}
                                    </div>
                                  )}
                                  {trigger.bcc && (
                                    <div>
                                      <span className="font-bold text-gray-450">BCC:</span>{' '}
                                      {trigger.bcc}
                                    </div>
                                  )}
                                  {(trigger.senderEmail || trigger.senderName) && (
                                    <div>
                                      <span className="font-bold text-gray-450">Sender:</span>{' '}
                                      {trigger.senderName
                                        ? `${trigger.senderName} <${trigger.senderEmail}>`
                                        : trigger.senderEmail}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenTemplatePreview(
                                      typeof trigger.templateId === 'object'
                                        ? (trigger.templateId as MessageTemplate).id
                                        : trigger.templateId,
                                    )
                                  }
                                  className="text-xs font-bold text-brand-500 hover:text-brand-650 flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye size={12} /> Preview
                                </button>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-gray-400">
                                    Status
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleToggleTriggerActive(selectedMapping, originalIndex)
                                    }
                                    className={`relative w-8 h-4.5 rounded-full transition-colors duration-250 shrink-0 ${
                                      trigger.isActive
                                        ? 'bg-brand-500'
                                        : 'bg-gray-250 dark:bg-navy-750'
                                    }`}
                                    disabled={!isAuthorized}
                                  >
                                    <span
                                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform duration-250 ${
                                        trigger.isActive ? 'translate-x-3.5' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Template Live Preview Render */}
            {previewTemplate && (
              <div className="border-t border-gray-150 dark:border-navy-800 pt-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-gray-800 dark:text-white">
                    Live Render Mock Layout: {previewTemplate.name}
                  </h6>
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex border border-gray-150 dark:border-navy-800 rounded-2xl overflow-hidden h-72">
                  {/* Mock variable inputs */}
                  {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                    <div className="w-56 bg-gray-50 dark:bg-navy-950 p-3 overflow-y-auto space-y-2 border-r border-gray-150 dark:border-navy-800">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                        Variables
                      </p>
                      {previewTemplate.variables.map((v) => (
                        <div key={v}>
                          <label className="block text-[9px] font-semibold text-gray-500 mb-0.5 font-mono">
                            {v}
                          </label>
                          <input
                            type="text"
                            value={previewValues[v] || ''}
                            onChange={(e) =>
                              setPreviewValues((prev) => ({ ...prev, [v]: e.target.value }))
                            }
                            className="w-full px-2 py-1 rounded bg-white text-[10px] border border-gray-200"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Iframe View */}
                  <div className="flex-1 bg-white p-2">
                    {previewTemplate.channel === CommunicationChannel.EMAIL ? (
                      <iframe
                        ref={iframeRef}
                        title="Listing Preview Output"
                        className="w-full h-full border border-gray-100 rounded-xl bg-white"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-medium whitespace-pre-wrap max-w-sm mx-auto shadow-inner">
                        {previewTemplate.textContent || 'No text content defined.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150 dark:border-navy-800">
              <Button variant="outline" type="button" onClick={handleCloseViewModal}>
                Close
              </Button>
              {isAuthorized && (
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => {
                    router.push(`/communications/mappings/${selectedMapping.id}`);
                    handleCloseViewModal();
                  }}
                >
                  Edit Mapping Setup
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
