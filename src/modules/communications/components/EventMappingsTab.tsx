'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useEventMappings } from '../hooks/useEventMappings';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import { useSystemEvents } from '../hooks/useSystemEvents';
import { useCommunicationProviders } from '../hooks/useCommunicationProviders';
import { EventTemplateMapping, MessageTemplate, BrevoSender } from '../types/communication.types';
import { useAuthStore } from '@/store/auth.store';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import {
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  ToggleLeft,
  Search,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';

// ── System Event Search Combobox ─────────────────────────────────
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Build flat list of filtered events for keyboard nav
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

  const flatFilteredEvents = useMemo(() => {
    return Object.values(filteredCategories).flat();
  }, [filteredCategories]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight when filtered results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-event-item]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback(
    (eventValue: string) => {
      onChange(eventValue);
      setSearchTerm('');
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isDropdownOpen) setIsDropdownOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsDropdownOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < flatFilteredEvents.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : flatFilteredEvents.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && flatFilteredEvents[highlightedIndex]) {
          handleSelect(flatFilteredEvents[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleTriggerClick = () => {
    setIsDropdownOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
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

  const totalEvents = Object.values(categories).flat().length;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left text-sm transition-all ${
          isDropdownOpen
            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-navy-900'
            : value
              ? 'border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900'
              : 'border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900'
        }`}
      >
        {value ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex-shrink-0 p-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg">
              <Zap size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{value}</p>
              <p className="text-[10px] text-gray-400 font-mono">{value.split('.')[0]} module</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 flex-1">
            Search and select a system event...
          </span>
        )}
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl shadow-2xl shadow-gray-900/10 dark:shadow-black/30 overflow-hidden animate-fade-in">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 dark:border-navy-700">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search events..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                autoComplete="off"
              />
            </div>
            {!isLoading && (
              <p className="text-[10px] text-gray-400 mt-1.5 px-1">
                {flatFilteredEvents.length} of {totalEvents} events
                {searchTerm && <span> matching &quot;{searchTerm}&quot;</span>}
              </p>
            )}
          </div>

          {/* Events List */}
          <div ref={listRef} className="max-h-64 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-brand-500" />
                <span className="text-xs text-gray-400">Loading events...</span>
              </div>
            ) : Object.keys(filteredCategories).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Search size={24} className="text-gray-300 dark:text-navy-600 mb-2" />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  No events found
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Try a different search term</p>
              </div>
            ) : (
              <div className="py-1">
                {(() => {
                  let globalIndex = 0;
                  return Object.entries(filteredCategories).map(([category, events]) => (
                    <div key={category}>
                      {/* Category Header */}
                      <div className="px-4 py-2 sticky top-0 bg-gray-50/95 dark:bg-navy-900/95 backdrop-blur-sm border-b border-gray-100/50 dark:border-navy-700/50">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-navy-400 uppercase tracking-widest">
                          {categoryLabels[category] || category}
                        </span>
                      </div>

                      {/* Event Items */}
                      {events.map((evt) => {
                        const currentIndex = globalIndex++;
                        const isHighlighted = currentIndex === highlightedIndex;
                        const isSelected = value === evt.value;

                        return (
                          <button
                            key={evt.key}
                            type="button"
                            data-event-item
                            onClick={() => handleSelect(evt.value)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isHighlighted
                                ? 'bg-brand-50 dark:bg-brand-500/10'
                                : isSelected
                                  ? 'bg-brand-50/50 dark:bg-brand-500/5'
                                  : 'hover:bg-gray-50 dark:hover:bg-navy-700/50'
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-brand-500' : 'bg-gray-300 dark:bg-navy-600'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm font-medium truncate ${
                                  isSelected
                                    ? 'text-brand-600 dark:text-brand-400'
                                    : 'text-gray-800 dark:text-gray-200'
                                }`}
                              >
                                {evt.value}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono truncate">
                                {evt.key.replace(/_/g, ' ').toLowerCase()}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-[9px] font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                SELECTED
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Message Template Search Combobox ─────────────────────────────
interface MessageTemplateComboboxProps {
  value: string;
  onChange: (value: string) => void;
  templates: MessageTemplate[];
  isLoading: boolean;
}

const MessageTemplateCombobox: React.FC<MessageTemplateComboboxProps> = ({
  value,
  onChange,
  templates,
  isLoading,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Group templates by channel, filtered by search term
  const groupedTemplates = useMemo(() => {
    const result: Record<string, MessageTemplate[]> = {};
    const query = searchTerm.toLowerCase().trim();

    for (const tpl of templates) {
      const match =
        tpl.name.toLowerCase().includes(query) ||
        tpl.slug.toLowerCase().includes(query) ||
        tpl.channel.toLowerCase().includes(query);

      if (match) {
        let arr = result[tpl.channel];
        if (!arr) {
          arr = [];
          result[tpl.channel] = arr;
        }
        arr.push(tpl);
      }
    }
    return result;
  }, [templates, searchTerm]);

  const flatTemplates = useMemo(() => {
    return Object.values(groupedTemplates).flat();
  }, [groupedTemplates]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight when filtered results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-template-item]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback(
    (tplId: string) => {
      onChange(tplId);
      setSearchTerm('');
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isDropdownOpen) setIsDropdownOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsDropdownOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < flatTemplates.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : flatTemplates.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && flatTemplates[highlightedIndex]) {
          handleSelect(flatTemplates[highlightedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleTriggerClick = () => {
    setIsDropdownOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === value);
  }, [templates, value]);

  const channelLabels: Record<string, string> = {
    email: 'Email Templates',
    sms: 'SMS Templates',
    push: 'Push Templates',
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left text-sm transition-all ${
          isDropdownOpen
            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-navy-900'
            : value
              ? 'border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900'
              : 'border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900'
        }`}
      >
        {selectedTemplate ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex-shrink-0 p-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg">
              <Zap size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {selectedTemplate.name}
              </p>
              <p className="text-[10px] text-gray-400 font-mono">
                {selectedTemplate.channel} &bull; slug: {selectedTemplate.slug}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 flex-1">
            Search and select a template...
          </span>
        )}
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl shadow-2xl shadow-gray-900/10 dark:shadow-black/30 overflow-hidden animate-fade-in">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 dark:border-navy-700">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search templates..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                autoComplete="off"
              />
            </div>
            {!isLoading && (
              <p className="text-[10px] text-gray-400 mt-1.5 px-1">
                {flatTemplates.length} of {templates.length} templates
                {searchTerm && <span> matching &quot;{searchTerm}&quot;</span>}
              </p>
            )}
          </div>

          {/* Templates List */}
          <div ref={listRef} className="max-h-64 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-brand-500" />
                <span className="text-xs text-gray-400">Loading templates...</span>
              </div>
            ) : Object.keys(groupedTemplates).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Search size={24} className="text-gray-300 dark:text-navy-600 mb-2" />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  No templates found
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Try a different search term</p>
              </div>
            ) : (
              <div className="py-1">
                {(() => {
                  let globalIndex = 0;
                  return Object.entries(groupedTemplates).map(([channel, tpls]) => (
                    <div key={channel}>
                      {/* Channel Header */}
                      <div className="px-4 py-2 sticky top-0 bg-gray-50/95 dark:bg-navy-900/95 backdrop-blur-sm border-b border-gray-100/50 dark:border-navy-700/50">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-navy-400 uppercase tracking-widest">
                          {channelLabels[channel] || channel}
                        </span>
                      </div>

                      {/* Template Items */}
                      {tpls.map((tpl) => {
                        const currentIndex = globalIndex++;
                        const isHighlighted = currentIndex === highlightedIndex;
                        const isSelected = value === tpl.id;

                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            data-template-item
                            onClick={() => handleSelect(tpl.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isHighlighted
                                ? 'bg-brand-50 dark:bg-brand-500/10'
                                : isSelected
                                  ? 'bg-brand-50/50 dark:bg-brand-500/5'
                                  : 'hover:bg-gray-50 dark:hover:bg-navy-700/50'
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-brand-500' : 'bg-gray-300 dark:bg-navy-600'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm font-medium truncate ${
                                  isSelected
                                    ? 'text-brand-600 dark:text-brand-400'
                                    : 'text-gray-800 dark:text-gray-200'
                                }`}
                              >
                                {tpl.name}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono truncate">
                                slug: {tpl.slug}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-[9px] font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                SELECTED
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────
export const EventMappingsTab: React.FC = () => {
  const { user } = useAuthStore();
  const isAuthorized = ['super_admin', 'admin'].includes(user?.role?.roleKey || '');

  const {
    mappings,
    isLoading,
    createMapping,
    isCreating,
    updateMapping,
    isUpdating,
    deleteMapping,
  } = useEventMappings();

  const { templates, isLoading: isLoadingTemplates } = useMessageTemplates({ limit: 100 });
  const { categories, isLoading: isLoadingEvents } = useSystemEvents();
  const { senders } = useCommunicationProviders();

  const verifiedSenders = useMemo(() => {
    return senders ? senders.filter((s: BrevoSender) => s.active) : [];
  }, [senders]);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<EventTemplateMapping | null>(null);

  // Form State
  const [event, setEvent] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === templateId);
  }, [templates, templateId]);

  const isEmailTemplate = selectedTemplate?.channel === 'email';

  const handleOpenModal = (mapping?: EventTemplateMapping) => {
    if (mapping) {
      setEditingMapping(mapping);
      setEvent(mapping.event);
      setTemplateId(
        typeof mapping.templateId === 'object'
          ? mapping.templateId.id
          : (mapping.templateId as string),
      );
      setSenderEmail(mapping.senderEmail || '');
      setSenderName(mapping.senderName || '');
      setIsActive(mapping.isActive);
    } else {
      setEditingMapping(null);
      setEvent('');
      setTemplateId('');
      setSenderEmail('');
      setSenderName('');
      setIsActive(true);
    }
    setError('');
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditingMapping(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event.trim()) {
      setError('Event name is required');
      return;
    }
    if (!templateId) {
      setError('Please select a message template');
      return;
    }

    try {
      if (editingMapping) {
        await updateMapping({
          id: editingMapping.id,
          data: {
            event: event.trim(),
            templateId,
            senderEmail: isEmailTemplate ? senderEmail.trim() || undefined : undefined,
            senderName: isEmailTemplate ? senderName.trim() || undefined : undefined,
            isActive,
          },
        });
      } else {
        await createMapping({
          event: event.trim(),
          templateId,
          senderEmail: isEmailTemplate ? senderEmail.trim() || undefined : undefined,
          senderName: isEmailTemplate ? senderName.trim() || undefined : undefined,
          isActive,
        });
      }
      handleCloseModal();
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : 'An error occurred while saving the mapping.';
      setError(errMsg);
    }
  };

  const handleDelete = async (mapping: EventTemplateMapping) => {
    if (window.confirm(`Are you sure you want to delete mapping for event: ${mapping.event}?`)) {
      try {
        await deleteMapping(mapping.id);
      } catch {
        // Handled by hook toast
      }
    }
  };

  const columns: Column<EventTemplateMapping>[] = [
    {
      header: 'Event Name',
      accessor: (m) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white text-sm">{m.event}</span>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5">dynamic system event</span>
        </div>
      ),
    },
    {
      header: 'Mapped Template',
      accessor: (m) => {
        const rawTemplateId = m.templateId as unknown;
        const template =
          rawTemplateId && typeof rawTemplateId === 'object'
            ? (rawTemplateId as MessageTemplate)
            : templates.find((t) => t.id === (rawTemplateId as string));
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
              {template ? template.name : 'Unknown Template'}
            </span>
            {template && (
              <span className="text-[10px] text-brand-500 font-semibold uppercase mt-0.5">
                {template.channel} (slug: {template.slug})
              </span>
            )}
            {m.senderEmail && (
              <span className="text-[10px] text-gray-400 dark:text-navy-400 font-mono mt-0.5 break-all">
                Sender: {m.senderName ? `${m.senderName} <${m.senderEmail}>` : m.senderEmail}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (m) => (
        <Badge
          color={m.isActive ? 'success' : 'warning'}
          className="font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg border-none shadow-sm"
        >
          {m.isActive ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (m) => (
        <div className="flex items-center gap-2">
          {isAuthorized ? (
            <>
              <button
                onClick={() => handleOpenModal(m)}
                className="p-1.5 text-gray-400 hover:text-brand-500 bg-gray-50 dark:bg-navy-950 hover:bg-brand-50 rounded-lg transition-all"
                title="Edit Mapping"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => handleDelete(m)}
                className="p-1.5 text-gray-400 hover:text-error-500 bg-gray-50 dark:bg-navy-950 hover:bg-error-50 rounded-lg transition-all"
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Event Mappings</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Map system events (e.g. nominee selection, registration) to communications templates
            dynamically.
          </p>
        </div>
        {isAuthorized && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenModal()}
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
            Map an event trigger to any templates to automate outbound messages.
          </p>
          {isAuthorized && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => handleOpenModal()}>
              Create Mapping
            </Button>
          )}
        </div>
      ) : (
        <DataTable data={mappings} columns={columns} isLoading={isLoading} />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title={editingMapping ? 'Edit Event Mapping' : 'Create Event Mapping'}
        className="!overflow-visible"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-2 text-xs font-semibold">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              System Event Name
            </label>
            <SystemEventCombobox
              value={event}
              onChange={setEvent}
              categories={categories}
              isLoading={isLoadingEvents}
            />
            <p className="text-[10px] text-gray-400 mt-1.5">
              Search and select a system event fired by the backend.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Message Template
            </label>
            <MessageTemplateCombobox
              value={templateId}
              onChange={setTemplateId}
              templates={templates}
              isLoading={isLoadingTemplates}
            />
          </div>

          {/* Email specific Custom Sender settings */}
          {isEmailTemplate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Custom Sender Email
                </label>
                <select
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 cursor-pointer"
                >
                  <option value="">Default Provider Email</option>
                  {verifiedSenders.map((sender: BrevoSender) => (
                    <option key={sender.id} value={sender.email}>
                      {sender.name} ({sender.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Custom Sender Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Acme Support"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-white">Active Status</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Enable or disable automated delivery for this event trigger.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
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

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-navy-800">
            <Button variant="outline" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isCreating || isUpdating}
              className="shadow-lg shadow-brand-500/20 px-6 font-bold"
            >
              {editingMapping ? 'Update Mapping' : 'Create Mapping'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
