'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import {
  MessageTemplate,
  CreateMessageTemplateDto,
  UpdateMessageTemplateDto,
  CommunicationChannel,
  BrevoSender,
} from '../types/communication.types';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import { useCommunicationProviders } from '../hooks/useCommunicationProviders';
import { ShieldQuestion } from 'lucide-react';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: MessageTemplate | null;
  defaultChannel?: CommunicationChannel;
}

export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  onClose,
  editData,
  defaultChannel,
}) => {
  const { createTemplate, isCreating, updateTemplate, isUpdating } = useMessageTemplates();
  const { senders } = useCommunicationProviders();
  const isEdit = !!editData;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [channel, setChannel] = useState<CommunicationChannel>(
    defaultChannel || CommunicationChannel.EMAIL,
  );
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [variablesRaw, setVariablesRaw] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const verifiedSenders = senders ? senders.filter((s: BrevoSender) => s.active) : [];

  useEffect(() => {
    if (isOpen && editData) {
      setName(editData.name);
      setSlug(editData.slug);
      setChannel(editData.channel);
      setSubject(editData.subject || '');
      setHtmlContent(editData.htmlContent || '');
      setTextContent(editData.textContent || '');
      setVariablesRaw(editData.variables?.join(', ') || '');
      setSenderEmail(editData.senderEmail || '');
      setSenderName(editData.senderName || '');
      setIsActive(editData.isActive);
    } else if (isOpen) {
      setName('');
      setSlug('');
      setChannel(defaultChannel || CommunicationChannel.EMAIL);
      setSubject('');
      setHtmlContent('');
      setTextContent('');
      setVariablesRaw('');
      setSenderEmail('');
      setSenderName('');
      setIsActive(true);
    }
    setErrors({});
  }, [isOpen, editData, defaultChannel]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const variables = parseVariables();

    try {
      if (isEdit && editData) {
        const data: UpdateMessageTemplateDto = {
          name: name.trim(),
          channel,
          subject: channel === CommunicationChannel.EMAIL ? subject.trim() : '',
          htmlContent: channel === CommunicationChannel.EMAIL ? htmlContent.trim() : '',
          textContent: textContent.trim() || undefined,
          variables,
          senderEmail: senderEmail.trim() || undefined,
          senderName: senderName.trim() || undefined,
          isActive,
        };
        await updateTemplate({ id: editData.id, data });
      } else {
        const data: CreateMessageTemplateDto = {
          name: name.trim(),
          slug: slug.trim(),
          channel,
          subject: channel === CommunicationChannel.EMAIL ? subject.trim() : '',
          htmlContent: channel === CommunicationChannel.EMAIL ? htmlContent.trim() : '',
          textContent: textContent.trim() || undefined,
          variables,
          senderEmail: senderEmail.trim() || undefined,
          senderName: senderName.trim() || undefined,
          isActive,
        };
        await createTemplate(data);
      }
      onClose();
    } catch {
      // Toast handles error message
    }
  };

  const isBusy = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Template: ${editData?.name}` : 'Create Message Template'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {/* Name */}
          <div className="col-span-2">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          {/* Interpolation variables */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Template Variables{' '}
              <span className="text-gray-400 font-normal normal-case">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={variablesRaw}
              onChange={(e) => setVariablesRaw(e.target.value)}
              placeholder="e.g. name, otp_code, verification_url"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900"
            />
          </div>
        </div>

        {/* Email specific Custom Sender settings */}
        {channel === CommunicationChannel.EMAIL && (
          <div className="grid grid-cols-2 gap-4">
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

        {/* Email dynamic HTML layout body */}
        {channel === CommunicationChannel.EMAIL && (
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              HTML Design Source code
            </label>
            <textarea
              rows={8}
              value={htmlContent}
              onChange={(e) => {
                setHtmlContent(e.target.value);
                setErrors((p) => ({ ...p, htmlContent: '' }));
              }}
              placeholder="e.g. <h1>Hello {{params.name}}</h1> <p>Click <a href='{{params.verification_url}}'>here</a> to verify</p>"
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
            rows={4}
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

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-white">Active Status</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Enable or disable using this layout in automation triggers.
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-navy-800">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="shadow-lg shadow-brand-500/20 px-6 font-bold"
            isLoading={isBusy}
          >
            {isEdit ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
