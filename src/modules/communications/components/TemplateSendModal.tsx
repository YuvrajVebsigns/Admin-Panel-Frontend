'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { MessageTemplate, SendTemplateMessageDto } from '../types/communication.types';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import { ShieldQuestion } from 'lucide-react';

interface TemplateSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: MessageTemplate | null;
}

export const TemplateSendModal: React.FC<TemplateSendModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const { sendTestMessage, isSendingTest } = useMessageTemplates();

  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [paramsRaw, setParamsRaw] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && template) {
      setRecipient('');
      setRecipientName('');

      // Auto generate placeholder parameters JSON based on template variables
      const placeholderObj: Record<string, string> = {};
      if (template.variables && template.variables.length > 0) {
        template.variables.forEach((v) => {
          placeholderObj[v] = `[${v} value]`;
        });
      } else {
        placeholderObj.name = 'John Doe';
      }
      setParamsRaw(JSON.stringify(placeholderObj, null, 2));
    }
    setErrors({});
  }, [isOpen, template]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!recipient.trim()) {
      errs.recipient = 'Recipient address/phone is required.';
    }
    if (template?.channel === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient.trim())) {
        errs.recipient = 'Must be a valid email address.';
      }
    }

    if (paramsRaw.trim()) {
      try {
        JSON.parse(paramsRaw);
      } catch {
        errs.params = 'Must be a valid JSON format.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !template) return;

    let params: Record<string, unknown> = {};
    if (paramsRaw.trim()) {
      params = JSON.parse(paramsRaw);
    }

    try {
      const dto: SendTemplateMessageDto = {
        slug: template.slug,
        recipient: recipient.trim(),
        recipientName: recipientName.trim() || undefined,
        params,
      };
      await sendTestMessage(dto);
      onClose();
    } catch {
      // Toast handles error message
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Test Dispatch: ${template?.name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Trigger a background task queue dispatch to send a test message using the provider
          resolved for the <strong className="text-brand-500 uppercase">{template?.channel}</strong>{' '}
          channel.
        </p>

        {/* Recipient */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Recipient {template?.channel === 'email' ? 'Email' : 'Phone number'}
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              setErrors((p) => ({ ...p, recipient: '' }));
            }}
            placeholder={template?.channel === 'email' ? 'test@user.com' : '+15550199'}
            className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
              errors.recipient ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
            }`}
          />
          {errors.recipient && (
            <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
              <ShieldQuestion size={12} /> {errors.recipient}
            </p>
          )}
        </div>

        {/* Recipient Name */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Recipient Display Name{' '}
            <span className="text-gray-400 font-normal normal-case">(Optional)</span>
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900"
          />
        </div>

        {/* Dynamic Params JSON */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Payload Interpolation Parameters (JSON)
          </label>
          <textarea
            rows={6}
            value={paramsRaw}
            onChange={(e) => {
              setParamsRaw(e.target.value);
              setErrors((p) => ({ ...p, params: '' }));
            }}
            placeholder={`{\n  "name": "John"\n}`}
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
              errors.params ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
            }`}
          />
          {errors.params && (
            <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
              <ShieldQuestion size={12} /> {errors.params}
            </p>
          )}
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
            isLoading={isSendingTest}
          >
            Dispatch Test Message
          </Button>
        </div>
      </form>
    </Modal>
  );
};
