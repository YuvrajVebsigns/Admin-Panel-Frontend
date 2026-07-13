'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import {
  CreateMessageTemplateDto,
  UpdateMessageTemplateDto,
  CommunicationChannel,
  SchemaDiscoveryResult,
} from '../types/communication.types';
import { useMessageTemplates, useMessageTemplate } from '../hooks/useMessageTemplates';
import { useSystemEvents } from '../hooks/useSystemEvents';
import { communicationService } from '@/services/communication.service';
import { ShieldQuestion, Copy, Zap, ArrowLeft, Info, Eye, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface SchemaComboboxProps {
  value: string;
  onChange: (value: string) => void;
  schemas: SchemaDiscoveryResult[];
  disabled?: boolean;
}

const SchemaCombobox: React.FC<SchemaComboboxProps> = ({ value, onChange, schemas, disabled }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSchemas = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return schemas.filter((s) => s.modelName.toLowerCase().includes(query));
  }, [schemas, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsDropdownOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-left text-sm transition-all ${
          disabled
            ? 'bg-gray-100 dark:bg-navy-950 text-gray-400 dark:text-gray-600 border-gray-250 dark:border-navy-800 cursor-not-allowed'
            : isDropdownOpen
              ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-navy-900 cursor-pointer'
              : 'border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 cursor-pointer'
        }`}
      >
        <span className={!value ? 'text-gray-400 dark:text-gray-550' : ''}>
          {value || '— Select Schema —'}
        </span>
        {!disabled && <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {isDropdownOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-navy-750">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search database schemas..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-900 border border-gray-150 dark:border-navy-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              autoComplete="off"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredSchemas.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-450 italic">No schemas found</div>
            ) : (
              <div className="py-1">
                {filteredSchemas.map((s) => (
                  <button
                    key={s.modelName}
                    type="button"
                    onClick={() => handleSelect(s.modelName)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-navy-700/50 ${
                      value === s.modelName
                        ? 'bg-brand-50/50 dark:bg-brand-500/5 font-semibold text-brand-650'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        value === s.modelName ? 'bg-brand-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="flex-1 truncate">{s.modelName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface TemplateFormProps {
  templateId?: string;
  defaultChannel?: CommunicationChannel;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({ templateId, defaultChannel }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryChannel = searchParams?.get('channel') as CommunicationChannel | undefined;

  const { createTemplate, isCreating, updateTemplate, isUpdating } = useMessageTemplates();
  const { events } = useSystemEvents();
  const isEdit = !!templateId;

  // Fetch data if editing
  const { data: editData, isLoading: isLoadingTemplate } = useMessageTemplate(templateId || '');

  const [schemaDiscovery, setSchemaDiscovery] = useState<SchemaDiscoveryResult[]>([]);
  const [baseSchema, setBaseSchema] = useState('');
  const [selectedRelations, setSelectedRelations] = useState<string[]>([]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [channel, setChannel] = useState<CommunicationChannel>(
    defaultChannel || queryChannel || CommunicationChannel.EMAIL,
  );
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [variablesRaw, setVariablesRaw] = useState('');
  const [linkedEvent, setLinkedEvent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getAutoSchemaForEvent = (event: string): string => {
    if (!event) return '';
    const ev = event.toLowerCase();
    if (ev.startsWith('nomination')) return 'Nomination';
    if (ev.startsWith('attendee') || ev.startsWith('registree')) return 'Registree';
    if (ev.startsWith('blog')) return 'Blog';
    if (ev.startsWith('contact')) return 'Contact';
    if (ev.startsWith('sponsor')) return 'Sponsor';
    if (ev.startsWith('event')) return 'Event';
    if (ev.startsWith('website')) return 'Website';
    return '';
  };

  useEffect(() => {
    communicationService
      .getSchemaDiscovery()
      .then((data) => setSchemaDiscovery(data))
      .catch(() => {});
  }, []);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [testValues, setTestValues] = useState<Record<string, string>>({});
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Parse variablesRaw into string array
  const parsedVars = useMemo(() => {
    return variablesRaw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }, [variablesRaw]);

  // Helper to generate sample mock values
  const getSampleValue = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes('name') || key.includes('user')) return 'John Doe';
    if (key.includes('email')) return 'john.doe@example.com';
    if (key.includes('otp') || key.includes('code')) return '489201';
    if (key.includes('url') || key.includes('link') || key.includes('href'))
      return 'https://example.com/verify-email';
    if (key.includes('phone') || key.includes('mobile')) return '+1 (555) 019-2834';
    if (key.includes('service')) return 'Enterprise Web Suite';
    if (key.includes('message'))
      return 'Hi, I would love to learn more about the custom web development packages.';
    if (key.includes('subject')) return 'Dynamic Subject Demo';
    if (key.includes('title')) return 'Hello World';
    if (key.includes('company') || key.includes('organization')) return 'Vebsigns Agency';
    if (key.includes('date') || key.includes('time')) return new Date().toLocaleDateString();
    return `[${name}]`;
  };

  // Keep testValues keys in sync with parsedVars
  useEffect(() => {
    setTestValues((prev) => {
      const updated = { ...prev };
      let changed = false;
      parsedVars.forEach((v) => {
        if (updated[v] === undefined || updated[v] === '') {
          updated[v] = getSampleValue(v);
          changed = true;
        }
      });
      // Optionally clean up removed ones
      Object.keys(updated).forEach((k) => {
        if (!parsedVars.includes(k)) {
          delete updated[k];
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [parsedVars]);

  // Compute rendered HTML content replacing variables with testValues
  const renderedHtml = useMemo(() => {
    let result = htmlContent;
    parsedVars.forEach((v) => {
      const mockVal = testValues[v] || '';
      // Replace all occurrences of {{params.variableName}} with mockVal
      const regex = new RegExp(`{{\\s*params\\.${v}\\s*}}`, 'g');
      result = result.replace(regex, mockVal);
    });
    return result;
  }, [htmlContent, parsedVars, testValues]);

  // Update iframe body with rendered html reactively
  useEffect(() => {
    if (isPreviewOpen && iframeRef.current) {
      const iframeDoc =
        iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(
          renderedHtml ||
            '<p style="font-family:sans-serif;color:#94a3b8;text-align:center;margin-top:100px;">No HTML content entered.</p>',
        );
        iframeDoc.close();
      }
    }
  }, [isPreviewOpen, renderedHtml]);

  const { relationFields, schemaVariables } = useMemo(() => {
    const relationFieldsList: { path: string; ref: string }[] = [];
    const variablesList: {
      field: string;
      type: string;
      description: string;
      isRelation: boolean;
    }[] = [];

    if (!baseSchema || schemaDiscovery.length === 0) {
      return { relationFields: relationFieldsList, schemaVariables: variablesList };
    }

    const traverse = (schemaModelName: string, prefixPath: string) => {
      const depth = prefixPath ? prefixPath.split('.').length : 0;
      if (depth > 6) return;

      const schema = schemaDiscovery.find((s) => s.modelName === schemaModelName);
      if (!schema) return;

      schema.fields.forEach((f) => {
        const fullPath = prefixPath ? `${prefixPath}.${f.path}` : f.path;

        if (f.ref) {
          relationFieldsList.push({ path: fullPath, ref: f.ref });
          if (selectedRelations.includes(fullPath)) {
            traverse(f.ref, fullPath);
          }
        } else {
          variablesList.push({
            field: fullPath,
            type: f.type,
            description: `${f.isArray ? 'Array of ' : ''}${f.type} field from ${schemaModelName}`,
            isRelation: !!prefixPath,
          });
        }
      });
    };

    traverse(baseSchema, '');

    return {
      relationFields: relationFieldsList,
      schemaVariables: variablesList,
    };
  }, [baseSchema, selectedRelations, schemaDiscovery]);

  // Populate form if editData changes
  useEffect(() => {
    if (isEdit && editData) {
      setName(editData.name);
      setSlug(editData.slug);
      setChannel(editData.channel);
      setSubject(editData.subject || '');
      setHtmlContent(editData.htmlContent || '');
      setTextContent(editData.textContent || '');
      setVariablesRaw(editData.variables?.join(', ') || '');
      setLinkedEvent(editData.linkedEvent || '');
      setBaseSchema(editData.baseSchema || '');
      setSelectedRelations(editData.relations || []);
      setIsActive(editData.isActive);
    }
  }, [isEdit, editData]);

  // Auto slugify when name changes (only for new templates)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Template name is required.';
    if (!slug.trim()) errs.slug = 'Unique slug ID is required.';
    else if (!/^[a-z0-9-_]+$/.test(slug)) {
      errs.slug = 'Slug can only contain lowercase letters, numbers, hyphens, and underscores.';
    }

    if (channel === CommunicationChannel.EMAIL) {
      if (!subject.trim()) errs.subject = 'Email subject is required.';
      if (!htmlContent.trim()) errs.htmlContent = 'HTML content is required.';
    } else {
      if (!textContent.trim()) errs.textContent = 'Message text content is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const parseVariables = (): string[] => {
    return variablesRaw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  };

  const handleCopyVariable = (fieldName: string) => {
    const variableText = `{{params.${fieldName}}}`;
    navigator.clipboard
      .writeText(variableText)
      .then(() => {
        toast.success(
          <span className="text-sm">
            Copied{' '}
            <code className="bg-gray-100 dark:bg-navy-800 px-1.5 py-0.5 rounded text-xs font-mono">
              {variableText}
            </code>{' '}
            to clipboard
          </span>,
          { duration: 2000 },
        );
      })
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = variableText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast.success(`Copied ${variableText} to clipboard`, { duration: 2000 });
      });
  };

  const handleVariableChipClick = (fieldName: string) => {
    const currentVars = variablesRaw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    const index = currentVars.indexOf(fieldName);
    const newVars = [...currentVars];

    if (index >= 0) {
      // Remove it from active variables
      newVars.splice(index, 1);
      toast.success(`Removed variable: ${fieldName}`, { duration: 1500 });
    } else {
      // Add it and copy value to clipboard
      newVars.push(fieldName);
      handleCopyVariable(fieldName);
    }
    setVariablesRaw(newVars.join(', '));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const variables = parseVariables();

    try {
      if (isEdit && templateId) {
        const data: UpdateMessageTemplateDto = {
          name: name.trim(),
          channel,
          subject: channel === CommunicationChannel.EMAIL ? subject.trim() : '',
          htmlContent: channel === CommunicationChannel.EMAIL ? htmlContent.trim() : '',
          textContent: textContent.trim() || undefined,
          variables,
          senderEmail: undefined,
          senderName: undefined,
          linkedEvent: linkedEvent || undefined,
          baseSchema: baseSchema || undefined,
          relations: selectedRelations.length > 0 ? selectedRelations : undefined,
          isActive,
        };
        await updateTemplate({ id: templateId, data });
      } else {
        const data: CreateMessageTemplateDto = {
          name: name.trim(),
          slug: slug.trim(),
          channel,
          subject: channel === CommunicationChannel.EMAIL ? subject.trim() : '',
          htmlContent: channel === CommunicationChannel.EMAIL ? htmlContent.trim() : '',
          textContent: textContent.trim() || undefined,
          variables,
          senderEmail: undefined,
          senderName: undefined,
          linkedEvent: linkedEvent || undefined,
          baseSchema: baseSchema || undefined,
          relations: selectedRelations.length > 0 ? selectedRelations : undefined,
          isActive,
        };
        await createTemplate(data);
      }
      router.push('/communications/templates');
    } catch {
      // Toast handles error message
    }
  };

  const handleCancel = () => {
    router.push('/communications/templates');
  };

  const isBusy = isCreating || isUpdating;

  if (isEdit && isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action header */}
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
              {isEdit ? `Edit Template: ${name}` : 'Create Message Template'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isEdit
                ? 'Modify message layout, subject, and event linkages.'
                : 'Create a new email or SMS notification layout.'}
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
            isLoading={isBusy}
          >
            {isEdit ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Template Title
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    handleNameChange(e.target.value);
                    setErrors((p) => ({ ...p, name: '' }));
                  }}
                  placeholder="e.g. User Signup Verification"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                    errors.name ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
                    <ShieldQuestion size={12} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Unique Slug */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Unique Slug ID
                </label>
                <input
                  type="text"
                  value={slug}
                  disabled={isEdit}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setErrors((p) => ({ ...p, slug: '' }));
                  }}
                  placeholder="e.g. verify-signup"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                    isEdit ? 'bg-gray-100 dark:bg-navy-950 cursor-not-allowed' : ''
                  } ${errors.slug ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'}`}
                />
                {errors.slug && (
                  <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
                    <ShieldQuestion size={12} /> {errors.slug}
                  </p>
                )}
              </div>
            </div>

            {/* Event or Schema dynamic variables list inside the main card */}
            {baseSchema ? (
              <div className="p-5 bg-gradient-to-br from-brand-500/5 to-indigo-500/5 rounded-2xl border border-brand-100 dark:border-brand-500/25 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-navy-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-brand-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                      Base Fields:
                      <code className="bg-brand-50 dark:bg-brand-500/10 px-1.5 py-0.5 rounded text-brand-600 dark:text-brand-400 font-mono text-xs ml-1.5">
                        {baseSchema}
                      </code>
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    Click to insert variable
                  </span>
                </div>

                {/* Render Base Schema Fields */}
                {schemaVariables.filter((v) => !v.isRelation).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {schemaVariables
                      .filter((v) => !v.isRelation)
                      .map((v) => {
                        const isActiveChip = parsedVars.includes(v.field);
                        return (
                          <button
                            key={v.field}
                            type="button"
                            onClick={() => handleVariableChipClick(v.field)}
                            title={`${v.description} (${v.type}) — Click to insert`}
                            className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-sm ${
                              isActiveChip
                                ? 'bg-brand-500 text-white border border-brand-600 shadow-md font-bold'
                                : 'bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-navy-700 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                            }`}
                          >
                            <Copy
                              size={11}
                              className={
                                isActiveChip
                                  ? 'text-white'
                                  : 'text-gray-400 group-hover:text-brand-500 transition-colors'
                              }
                            />
                            <span>{v.field}</span>
                            {isActiveChip && (
                              <span className="text-[9px] bg-brand-600 px-1.5 py-0.2 rounded font-sans font-bold">
                                Selected
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No base variables found.</p>
                )}

                {/* Add-on Relation Fields (Schemas) */}
                {relationFields.length > 0 && (
                  <div className="pt-2 border-t border-gray-250/50 dark:border-navy-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                        Add-on Schemas (Relations):
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        Select relation to show its variables below
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {relationFields.map((f) => {
                        const isAdded = selectedRelations.includes(f.path);
                        return (
                          <button
                            key={f.path}
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                setSelectedRelations((prev) =>
                                  prev.filter((r) => r !== f.path && !r.startsWith(`${f.path}.`)),
                                );
                              } else {
                                setSelectedRelations((prev) => [...prev, f.path]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer ${
                              isAdded
                                ? 'bg-indigo-600 text-white border-indigo-700'
                                : 'bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-navy-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                            }`}
                          >
                            {isAdded ? '✓ ' : '+ '} {f.path} ({f.ref})
                          </button>
                        );
                      })}
                    </div>

                    {/* Relation variables if any relation is selected */}
                    {schemaVariables.filter((v) => v.isRelation).length > 0 && (
                      <div className="pt-3 space-y-2">
                        <span className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wide block">
                          Relation Fields Variables:
                        </span>
                        <div className="flex flex-wrap gap-2 bg-indigo-50/30 dark:bg-indigo-950/10 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-950/30">
                          {schemaVariables
                            .filter((v) => v.isRelation)
                            .map((v) => {
                              const isActiveChip = parsedVars.includes(v.field);
                              return (
                                <button
                                  key={v.field}
                                  type="button"
                                  onClick={() => handleVariableChipClick(v.field)}
                                  title={`${v.description} (${v.type}) — Click to insert`}
                                  className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-sm ${
                                    isActiveChip
                                      ? 'bg-indigo-500 text-white border border-indigo-600 shadow-md font-bold'
                                      : 'bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-navy-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                                  }`}
                                >
                                  <Copy
                                    size={11}
                                    className={
                                      isActiveChip
                                        ? 'text-white'
                                        : 'text-gray-400 group-hover:text-indigo-500 transition-colors'
                                    }
                                  />
                                  <span>{v.field}</span>
                                  {isActiveChip && (
                                    <span className="text-[9px] bg-indigo-650 px-1.5 py-0.2 rounded font-sans font-bold">
                                      Selected
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-150 dark:border-navy-800 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Info size={14} className="text-brand-500 shrink-0" />
                <span>
                  Tip: Choose a base database schema or link a system event in the sidebar
                  configuration to discover dynamic variables.
                </span>
              </div>
            )}

            {/* Interpolation variables input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center justify-between">
                <span>Detected Template Variables</span>
                <span className="text-[10px] text-gray-400 font-normal normal-case">
                  Comma-separated list of active variables (auto-filled on chip click)
                </span>
              </label>
              <input
                type="text"
                value={variablesRaw}
                onChange={(e) => setVariablesRaw(e.target.value)}
                placeholder="e.g. name, otp_code, verification_url"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900"
              />
            </div>

            {/* Email specific subject */}
            {channel === CommunicationChannel.EMAIL && (
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setErrors((p) => ({ ...p, subject: '' }));
                  }}
                  placeholder="e.g. Confirm your signup code {{params.otp_code}}"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                    errors.subject ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
                  }`}
                />
                {errors.subject && (
                  <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
                    <ShieldQuestion size={12} /> {errors.subject}
                  </p>
                )}
              </div>
            )}

            {/* Simple HTML Textarea Editor with Preview button */}
            {channel === CommunicationChannel.EMAIL && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    HTML Template Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 dark:text-brand-400 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Preview HTML Output</span>
                  </button>
                </div>
                <textarea
                  rows={15}
                  value={htmlContent}
                  onChange={(e) => {
                    setHtmlContent(e.target.value);
                    setErrors((p) => ({ ...p, htmlContent: '' }));
                  }}
                  placeholder="<html>\n  <body>\n    <h1>Welcome {{params.name}}!</h1>\n  </body>\n</html>"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                    errors.htmlContent ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
                  }`}
                />
                {errors.htmlContent && (
                  <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
                    <ShieldQuestion size={12} /> {errors.htmlContent}
                  </p>
                )}
              </div>
            )}

            {/* Fallback Text content (always shown, serves as SMS text or Email plain text body) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Fallback Plain-text message body
              </label>
              <textarea
                rows={5}
                value={textContent}
                onChange={(e) => {
                  setTextContent(e.target.value);
                  setErrors((p) => ({ ...p, textContent: '' }));
                }}
                placeholder="e.g. Hi {{params.name}}, your signup verification code is {{params.otp_code}}"
                className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                  errors.textContent ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
                }`}
              />
              {errors.textContent && (
                <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
                  <ShieldQuestion size={12} /> {errors.textContent}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          {/* Metadata settings */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-navy-800 pb-3">
              Template Configuration
            </h3>

            {/* Channel */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Channel
              </label>
              <select
                value={channel}
                disabled={isEdit}
                onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 cursor-pointer"
              >
                <option value={CommunicationChannel.EMAIL}>📧 Email</option>
                <option value={CommunicationChannel.SMS}>💬 SMS</option>
                <option value={CommunicationChannel.PUSH}>Bell Push</option>
              </select>
            </div>

            {/* Linked System Event */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Linked System Event
              </label>
              <select
                value={linkedEvent}
                onChange={(e) => {
                  const ev = e.target.value;
                  setLinkedEvent(ev);
                  const autoSchema = getAutoSchemaForEvent(ev);
                  setBaseSchema(autoSchema);
                  setSelectedRelations([]);
                  setVariablesRaw(''); // Reset variables when system event changes
                }}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 cursor-pointer"
              >
                <option value="">— No event linked —</option>
                {events.map((ev: string) => (
                  <option key={ev} value={ev}>
                    {ev}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Database Schema */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Base Database Schema
              </label>
              <SchemaCombobox
                value={baseSchema}
                disabled={!!linkedEvent}
                onChange={(val) => {
                  setBaseSchema(val);
                  setSelectedRelations([]); // reset relations on schema change
                }}
                schemas={schemaDiscovery}
              />
            </div>

            {/* Include Relation Fields */}
            {baseSchema && relationFields.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Include Relation Fields
                </label>
                <div className="flex flex-wrap gap-2">
                  {relationFields.map((f) => {
                    const isAdded = selectedRelations.includes(f.path);
                    return (
                      <button
                        key={f.path}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            setSelectedRelations((prev) =>
                              prev.filter((r) => r !== f.path && !r.startsWith(`${f.path}.`)),
                            );
                          } else {
                            setSelectedRelations((prev) => [...prev, f.path]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isAdded
                            ? 'bg-brand-500 text-white border-brand-600'
                            : 'bg-gray-50 dark:bg-navy-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-navy-800 hover:border-brand-300'
                        }`}
                      >
                        {isAdded ? '✓ ' : '+ '} {f.path} ({f.ref})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">Active Status</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Enable using this layout in triggers.
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
          </div>
        </div>
      </div>

      {/* HTML Preview Modal Overlay */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 w-full max-w-6xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-gray-150 dark:border-navy-800 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-150 dark:border-navy-800 flex items-center justify-between bg-gray-50 dark:bg-navy-950">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye size={18} className="text-brand-500" />
                  <span>HTML Template Live Preview</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Test dynamic template parameters using variables mock fields below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-navy-800 rounded-xl transition-all text-gray-500 dark:text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Pane */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Mock Inputs Pane */}
              <div className="w-80 border-r border-gray-150 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950/20 p-5 overflow-y-auto space-y-4">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Test Variables Data
                </h4>
                {parsedVars.length > 0 ? (
                  <div className="space-y-3">
                    {parsedVars.map((v) => (
                      <div key={v}>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 font-mono">
                          {v}
                        </label>
                        <input
                          type="text"
                          value={testValues[v] || ''}
                          onChange={(e) =>
                            setTestValues((prev) => ({ ...prev, [v]: e.target.value }))
                          }
                          placeholder={`Value for ${v}`}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 dark:text-gray-500 italic p-4 bg-gray-100 dark:bg-navy-900/50 rounded-xl border border-gray-150 dark:border-navy-800/50">
                    No variables defined. Set variables in Detected Template Variables field to test
                    mock inputs.
                  </div>
                )}
              </div>

              {/* Right Rendered Preview */}
              <div className="flex-1 bg-white p-4 relative">
                <iframe
                  ref={iframeRef}
                  title="HTML Output Live Preview"
                  className="w-full h-full border border-gray-150 rounded-2xl bg-white shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
