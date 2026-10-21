'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import {
  WebhookSubscription,
  CreateWebhookDto,
  UpdateWebhookDto,
} from '../types/communication.types';
import { useWebhookSubscriptions } from '../hooks/useWebhookSubscriptions';
import { ShieldQuestion } from 'lucide-react';

interface WebhookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: WebhookSubscription | null;
}

export const WebhookFormModal: React.FC<WebhookFormModalProps> = ({
  isOpen,
  onClose,
  editData,
}) => {
  const { createWebhook, isCreating, updateWebhook, isUpdating } = useWebhookSubscriptions();
  const isEdit = !!editData;

  const [url, setUrl] = useState('');
  const [eventsRaw, setEventsRaw] = useState('');
  const [secret, setSecret] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && editData) {
      setUrl(editData.url);
      setEventsRaw(editData.events.join(', '));
      setSecret(editData.secret);
      setIsActive(editData.isActive);
    } else if (isOpen) {
      setUrl('');
      setEventsRaw('*');
      setSecret('');
      setIsActive(true);
    }
    setErrors({});
  }, [isOpen, editData]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!url.trim()) errs.url = 'URL is required.';
    else {
      try {
        new URL(url);
      } catch {
        errs.url = 'Must be a valid URL.';
      }
    }
    if (!eventsRaw.trim()) errs.events = 'At least one event is required.';
    if (!secret.trim()) errs.secret = 'Secret key is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const parseEvents = (): string[] => {
    return eventsRaw
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit && editData) {
        const data: UpdateWebhookDto = {
          url: url.trim(),
          events: parseEvents(),
          secret: secret.trim(),
          isActive,
        };
        await updateWebhook({ id: editData.id, data });
      } else {
        const data: CreateWebhookDto = {
          url: url.trim(),
          events: parseEvents(),
          secret: secret.trim(),
          isActive,
        };
        await createWebhook(data);
      }
      onClose();
    } catch {
      // Handled by mutation hook toast
    }
  };

  const isBusy = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Webhook Subscription' : 'Create Webhook Subscription'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* URL */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Endpoint URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setErrors((p) => ({ ...p, url: '' }));
            }}
            placeholder="https://your-system.com/webhook"
            className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${errors.url ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'}`}
          />
          {errors.url && (
            <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
              <ShieldQuestion size={12} /> {errors.url}
            </p>
          )}
        </div>

        {/* Events */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Events{' '}
            <span className="text-gray-400 font-normal normal-case">
              (comma-separated, use * for all)
            </span>
          </label>
          <input
            type="text"
            value={eventsRaw}
            onChange={(e) => {
              setEventsRaw(e.target.value);
              setErrors((p) => ({ ...p, events: '' }));
            }}
            placeholder="blog.published, event.created, *"
            className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${errors.events ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'}`}
          />
          {errors.events && (
            <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
              <ShieldQuestion size={12} /> {errors.events}
            </p>
          )}
        </div>

        {/* Secret */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            HMAC Secret Key
          </label>
          <input
            type="text"
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value);
              setErrors((p) => ({ ...p, secret: '' }));
            }}
            placeholder="secret_signature_key_xyz"
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${errors.secret ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'}`}
          />
          {errors.secret && (
            <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
              <ShieldQuestion size={12} /> {errors.secret}
            </p>
          )}
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-white">Active Status</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Enable or disable this webhook subscription
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${isActive ? 'bg-brand-500' : 'bg-gray-300 dark:bg-navy-700'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
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
            {isEdit ? 'Update Subscription' : 'Create Subscription'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
