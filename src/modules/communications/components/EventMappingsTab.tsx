'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEventMappings } from '../hooks/useEventMappings';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { communicationService } from '@/services/communication.service';

export const EventMappingsTab: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthorized = ['super_admin', 'admin'].includes(user?.role?.roleKey || '');

  const { mappings, isLoading, deleteMapping } = useEventMappings();
  const { templates } = useMessageTemplates({ limit: 150 });

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
        iframeDoc.close();
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
      // Reload page state or query client will update cache automatically
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

      // Update selectedMapping state so drawer is in sync
      setSelectedMapping(updated);
      toast.success(`Action trigger status updated`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to update trigger status.';
      toast.error(errMsg);
    }
  };

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
      header: 'Mapped Notifications & Channels',
      accessor: (m) => {
        const triggersCount = m.triggers?.length || 0;
        // Collect channel types
        const channelTypes = m.triggers?.map((t) => t.channel) || [];
        const hasEmail = channelTypes.includes(CommunicationChannel.EMAIL);
        const hasSms = channelTypes.includes(CommunicationChannel.SMS);
        const hasPush = channelTypes.includes(CommunicationChannel.PUSH);

        return (
          <div className="flex items-center gap-2.5">
            <Badge color="info" className="font-bold text-[10px] rounded-lg px-2.5 py-1">
              {triggersCount} Action{triggersCount !== 1 ? 's' : ''}
            </Badge>
            <div className="flex items-center gap-1.5 text-gray-450 dark:text-navy-400">
              {hasEmail && (
                <span title="Email">
                  <Mail size={13} />
                </span>
              )}
              {hasSms && (
                <span title="SMS">
                  <MessageSquare size={13} />
                </span>
              )}
              {hasPush && (
                <span title="Push">
                  <Bell size={13} />
                </span>
              )}
            </div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
            Event Mappings
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Map system events to multiple communication action templates.
          </p>
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

      {mappings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-navy-950 border border-dashed border-gray-200 dark:border-navy-800 rounded-3xl text-center">
          <ToggleLeft size={40} className="text-gray-400 mb-3" />
          <p className="text-sm font-bold text-gray-800 dark:text-white">No Event Mappings</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            Configure parent event triggers to automate notifications setup.
          </p>
          {isAuthorized && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => router.push('/communications/mappings/create')}
            >
              Create Mapping
            </Button>
          )}
        </div>
      ) : (
        <DataTable data={mappings} columns={columns} isLoading={isLoading} />
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

            <div className="space-y-3">
              <h5 className="text-[11px] font-bold text-gray-450 uppercase tracking-widest">
                Notification Actions triggers ({selectedMapping.triggers?.length || 0})
              </h5>

              {!selectedMapping.triggers || selectedMapping.triggers.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No triggers defined for this event mapping.
                </p>
              ) : (
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                  {selectedMapping.triggers.map((trigger, idx) => {
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
                        key={idx}
                        className="p-4 bg-white dark:bg-navy-900 border border-gray-150 dark:border-navy-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                              Action #{idx + 1}:
                            </span>
                            <Badge
                              color="info"
                              className="text-[9px] rounded font-bold px-1.5 py-0.5 uppercase"
                            >
                              {trigger.channel}
                            </Badge>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
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
                              <span className="font-bold text-gray-450">To:</span> {trigger.to}
                            </div>
                            {trigger.cc && (
                              <div>
                                <span className="font-bold text-gray-450">CC:</span> {trigger.cc}
                              </div>
                            )}
                            {trigger.bcc && (
                              <div>
                                <span className="font-bold text-gray-450">BCC:</span> {trigger.bcc}
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
                              Trigger Status
                            </span>
                            <button
                              onClick={() => handleToggleTriggerActive(selectedMapping, idx)}
                              className={`relative w-8 h-4.5 rounded-full transition-colors duration-250 shrink-0 ${
                                trigger.isActive ? 'bg-brand-500' : 'bg-gray-250 dark:bg-navy-750'
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
