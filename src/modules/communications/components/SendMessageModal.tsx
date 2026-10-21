'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { CommunicationChannel, SendMessageDto } from '../types/communication.types';
import { useCommunicationLogs } from '../hooks/useCommunicationLogs';
import { Mail, MessageSquare, Bell, Link2, ShieldQuestion } from 'lucide-react';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANNELS: {
  value: CommunicationChannel;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  contentPlaceholder: string;
  activeColor: string;
  activeBg: string;
}[] = [
  {
    value: CommunicationChannel.EMAIL,
    label: 'Email',
    icon: <Mail size={18} />,
    placeholder: 'Email address (e.g., user@example.com)',
    contentPlaceholder: 'HTML or plain text email body...',
    activeColor: 'text-blue-600 dark:text-blue-400',
    activeBg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
  },
  {
    value: CommunicationChannel.SMS,
    label: 'SMS',
    icon: <MessageSquare size={18} />,
    placeholder: 'Phone number (e.g., +1234567890)',
    contentPlaceholder: 'Plain text SMS message...',
    activeColor: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
  },
  {
    value: CommunicationChannel.PUSH,
    label: 'Push',
    icon: <Bell size={18} />,
    placeholder: 'Device token',
    contentPlaceholder: 'Push notification body text...',
    activeColor: 'text-purple-600 dark:text-purple-400',
    activeBg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30',
  },
  {
    value: CommunicationChannel.WEBHOOK,
    label: 'Webhook',
    icon: <Link2 size={18} />,
    placeholder: 'Webhook URL (e.g., https://api.example.com/hook)',
    contentPlaceholder: 'JSON payload string...',
    activeColor: 'text-orange-600 dark:text-orange-400',
    activeBg: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30',
  },
];

export const SendMessageModal: React.FC<SendMessageModalProps> = ({ isOpen, onClose }) => {
  const { sendMessage, isSending } = useCommunicationLogs();

  const [channel, setChannel] = useState<CommunicationChannel>(CommunicationChannel.EMAIL);
  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadataRaw, setMetadataRaw] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setChannel(CommunicationChannel.EMAIL);
      setRecipient('');
      setTitle('');
      setContent('');
      setMetadataRaw('');
      setErrors({});
    }
  }, [isOpen]);

  const activeChannelCfg = (CHANNELS.find((c) => c.value === channel) || CHANNELS[0])!;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!recipient.trim()) errs.recipient = 'Recipient is required.';
    if (!title.trim()) errs.title = 'Title is required.';
    if (!content.trim()) errs.content = 'Content is required.';
    if (metadataRaw.trim()) {
      try {
        JSON.parse(metadataRaw);
      } catch {
        errs.metadata = 'Metadata must be valid JSON.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: SendMessageDto = {
      channel,
      recipient: recipient.trim(),
      title: title.trim(),
      content: content.trim(),
    };

    if (metadataRaw.trim()) {
      payload.metadata = JSON.parse(metadataRaw);
    }

    try {
      await sendMessage(payload);
      onClose();
    } catch {
      // Handled by mutation hook toast
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Manual Message" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Channel Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Select Channel
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CHANNELS.map((ch) => (
              <button
                key={ch.value}
                type="button"
                onClick={() => setChannel(ch.value)}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border text-sm font-bold transition-all ${
                  channel === ch.value
                    ? `${ch.activeBg} ${ch.activeColor} shadow-sm`
                    : 'border-gray-200 dark:border-navy-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-900'
                }`}
              >
                {ch.icon}
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Recipient
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              if (e.target.value.trim()) setErrors((prev) => ({ ...prev, recipient: '' }));
            }}
            placeholder={activeChannelCfg.placeholder}
            className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
              errors.recipient
                ? 'border-error-500 focus:ring-error-500/20'
                : 'border-gray-200 dark:border-navy-800'
            }`}
          />
          {errors.recipient && (
            <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
              <ShieldQuestion size={12} /> {errors.recipient}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Title / Subject
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="Message subject or event name"
            className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
              errors.title
                ? 'border-error-500 focus:ring-error-500/20'
                : 'border-gray-200 dark:border-navy-800'
            }`}
          />
          {errors.title && (
            <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
              <ShieldQuestion size={12} /> {errors.title}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Content
          </label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (e.target.value.trim()) setErrors((prev) => ({ ...prev, content: '' }));
            }}
            placeholder={activeChannelCfg.contentPlaceholder}
            className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 resize-none ${
              errors.content
                ? 'border-error-500 focus:ring-error-500/20'
                : 'border-gray-200 dark:border-navy-800'
            }`}
          />
          {errors.content && (
            <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
              <ShieldQuestion size={12} /> {errors.content}
            </p>
          )}
        </div>

        {/* Metadata (Optional) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Metadata{' '}
            <span className="text-gray-400 dark:text-navy-500 font-normal normal-case">
              (optional JSON)
            </span>
          </label>
          <textarea
            rows={3}
            value={metadataRaw}
            onChange={(e) => {
              setMetadataRaw(e.target.value);
              setErrors((prev) => ({ ...prev, metadata: '' }));
            }}
            placeholder='{ "source": "admin_panel" }'
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 resize-none ${
              errors.metadata
                ? 'border-error-500 focus:ring-error-500/20'
                : 'border-gray-200 dark:border-navy-800'
            }`}
          />
          {errors.metadata && (
            <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
              <ShieldQuestion size={12} /> {errors.metadata}
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
            isLoading={isSending}
          >
            Send Message
          </Button>
        </div>
      </form>
    </Modal>
  );
};
