'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import {
  CommunicationProvider,
  CreateCommunicationProviderDto,
  UpdateCommunicationProviderDto,
  CommunicationChannel,
} from '../types/communication.types';
import { useCommunicationProviders } from '../hooks/useCommunicationProviders';
import { ShieldQuestion } from 'lucide-react';

interface ProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: CommunicationProvider | null;
}

export const ProviderFormModal: React.FC<ProviderFormModalProps> = ({
  isOpen,
  onClose,
  editData,
}) => {
  const { createProvider, isCreating, updateProvider, isUpdating } = useCommunicationProviders();
  const isEdit = !!editData;

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [channel, setChannel] = useState<CommunicationChannel>(CommunicationChannel.EMAIL);
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && editData) {
      setName(editData.name);
      setDisplayName(editData.displayName);
      setChannel(editData.channel);
      setPriority(editData.priority);
      setIsActive(editData.isActive);
      setApiKey(''); // Don't prepopulate sensitive API keys from the server
      setSenderEmail((editData.config?.senderEmail as string) || '');
      setSenderName((editData.config?.senderName as string) || '');
      setAdminEmail((editData.config?.adminEmail as string) || '');
    } else if (isOpen) {
      setName('');
      setDisplayName('');
      setChannel(CommunicationChannel.EMAIL);
      setPriority(10);
      setIsActive(true);
      setApiKey('');
      setSenderEmail('');
      setSenderName('');
      setAdminEmail('');
    }
    setErrors({});
  }, [isOpen, editData]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Provider name (code) is required.';
    if (!displayName.trim()) errs.displayName = 'Display Name is required.';
    if (!isEdit && !apiKey.trim() && name.toLowerCase() === 'brevo') {
      errs.apiKey = 'API Key is required for new Brevo registration.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (name.toLowerCase() === 'brevo' && senderEmail.trim()) {
      if (!emailRegex.test(senderEmail)) {
        errs.senderEmail = 'Must be a valid email address.';
      }
    }
    if (adminEmail.trim()) {
      const emails = adminEmail.split(',').map((e) => e.trim());
      const invalidEmails = emails.filter((e) => !emailRegex.test(e));
      if (invalidEmails.length > 0) {
        errs.adminEmail = 'Must contain valid email addresses separated by commas.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const credentials: Record<string, string> = {};
    if (apiKey.trim()) {
      credentials.apiKey = apiKey.trim();
    }

    const config: Record<string, unknown> = {};
    if (senderEmail.trim()) config.senderEmail = senderEmail.trim();
    if (senderName.trim()) config.senderName = senderName.trim();
    if (adminEmail.trim()) config.adminEmail = adminEmail.trim();

    try {
      if (isEdit && editData) {
        const data: UpdateCommunicationProviderDto = {
          displayName: displayName.trim(),
          priority,
          isActive,
          credentials: Object.keys(credentials).length ? credentials : undefined,
          config,
        };
        await updateProvider({ id: editData.id, data });
      } else {
        const data: CreateCommunicationProviderDto = {
          name: name.trim().toLowerCase(),
          displayName: displayName.trim(),
          channel,
          priority,
          isActive,
          credentials,
          config,
        };
        await createProvider(data);
      }
      onClose();
    } catch {
      // Handled by react-query toast
    }
  };

  const isBusy = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit ? `Configure Provider: ${editData?.displayName}` : 'Register Communication Provider'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Code Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              System Code Name
            </label>
            <input
              type="text"
              value={name}
              disabled={isEdit}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: '' }));
              }}
              placeholder="e.g. brevo, sendgrid"
              className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                isEdit ? 'bg-gray-100 dark:bg-navy-950 cursor-not-allowed' : ''
              } ${errors.name ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'}`}
            />
            {errors.name && (
              <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
                <ShieldQuestion size={12} /> {errors.name}
              </p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Display Label
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setErrors((p) => ({ ...p, displayName: '' }));
              }}
              placeholder="e.g. Brevo SMTP"
              className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                errors.displayName ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
              }`}
            />
            {errors.displayName && (
              <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
                <ShieldQuestion size={12} /> {errors.displayName}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Channel */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Delivery Channel
            </label>
            <select
              value={channel}
              disabled={isEdit}
              onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
              className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                isEdit ? 'bg-gray-100 dark:bg-navy-950 cursor-not-allowed' : ''
              } border-gray-200 dark:border-navy-800`}
            >
              <option value={CommunicationChannel.EMAIL}>📧 Email</option>
              <option value={CommunicationChannel.SMS}>💬 SMS</option>
              <option value={CommunicationChannel.PUSH}>Bell Push</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Priority Ranking (1-100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 border-gray-200 dark:border-navy-800"
            />
          </div>
        </div>

        {/* Credentials / API Key */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            API Key / Token{' '}
            {isEdit && (
              <span className="text-gray-400 font-normal normal-case">
                (leave blank to keep unchanged)
              </span>
            )}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setErrors((p) => ({ ...p, apiKey: '' }));
            }}
            placeholder={isEdit ? '••••••••••••••••••••••••' : 'Paste API authentication key'}
            className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
              errors.apiKey ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
            }`}
          />
          {errors.apiKey && (
            <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
              <ShieldQuestion size={12} /> {errors.apiKey}
            </p>
          )}
        </div>

        {/* Dynamic Config: Sender Settings */}
        <div className="p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800 space-y-4">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Sender & Admin Customization Settings
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                Sender Email
              </label>
              <input
                type="text"
                value={senderEmail}
                onChange={(e) => {
                  setSenderEmail(e.target.value);
                  setErrors((p) => ({ ...p, senderEmail: '' }));
                }}
                placeholder="noreply@coremedia.com"
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                  errors.senderEmail ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
                }`}
              />
              {errors.senderEmail && (
                <p className="text-[10px] text-error-500 mt-0.5 font-semibold">
                  {errors.senderEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                Sender Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Core Media Group"
                className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 border-gray-200 dark:border-navy-800"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                System Admin Email(s)
              </label>
              <input
                type="text"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  setErrors((p) => ({ ...p, adminEmail: '' }));
                }}
                placeholder="admin@coremedia.com, support@coremedia.com"
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white bg-white dark:bg-navy-900 ${
                  errors.adminEmail ? 'border-error-500' : 'border-gray-200 dark:border-navy-800'
                }`}
              />
              {errors.adminEmail ? (
                <p className="text-[10px] text-error-500 mt-0.5 font-semibold">
                  {errors.adminEmail}
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Comma-separated emails that will receive system administrative notifications.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl border border-gray-100 dark:border-navy-800">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-white">Enable Provider</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Turn on delivery of messages through this provider plugin.
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
            {isEdit ? 'Save Settings' : 'Register Provider'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
