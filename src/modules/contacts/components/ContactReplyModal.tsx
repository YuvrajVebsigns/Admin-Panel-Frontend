'use client';

import React, { useState, useEffect } from 'react';
import { Contact, ContactStatus } from '../types/contact.types';
import { useContacts } from '../hooks/useContacts';
import Button from '@/components/ui/button/Button';
import {
  X,
  Mail,
  Phone,
  Calendar,
  Globe,
  MessageSquare,
  CornerUpLeft,
  CheckCircle2,
  UserCheck,
  ShieldQuestion,
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

interface ContactReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactData: Contact | null;
}

export const ContactReplyModal: React.FC<ContactReplyModalProps> = ({
  isOpen,
  onClose,
  contactData,
}) => {
  const { replyContact, isReplying } = useContacts();
  const [replyMessage, setReplyMessage] = useState('');
  const [error, setError] = useState('');

  // Prefill reply greeting
  useEffect(() => {
    if (contactData && contactData.status === ContactStatus.PENDING) {
      setReplyMessage(
        `Hi ${contactData.fullName},\n\nThank you for reaching out to us regarding ${contactData.service}.\n\n`,
      );
    } else if (contactData && contactData.status === ContactStatus.REPLIED) {
      setReplyMessage(contactData.replyMessage || '');
    } else {
      setReplyMessage('');
    }
    setError('');
  }, [contactData, isOpen]);

  if (!isOpen || !contactData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      setError('Please type a response message.');
      return;
    }

    try {
      await replyContact({
        id: contactData.id,
        data: { replyMessage },
      });
      onClose();
    } catch (err) {
      // Error is handled by query mutation hook toast
    }
  };

  const website = typeof contactData.websiteId === 'object' ? contactData.websiteId : null;
  const repliedBy = typeof contactData.repliedBy === 'object' ? contactData.repliedBy : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Submission Details */}
        <div className="w-full md:w-5/12 bg-gray-50 dark:bg-navy-950 p-6 flex flex-col justify-between border-r border-gray-100 dark:border-navy-800 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Submission Profile
                </h3>
                <Badge
                  color={contactData.status === ContactStatus.REPLIED ? 'success' : 'warning'}
                  className="font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-md border-none shadow-sm"
                >
                  {contactData.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Inquiry details submitted via the public portal.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Contact Sender
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                    {contactData.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {contactData.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Phone size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Phone Connection
                  </p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {contactData.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Globe size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Originating Website
                  </p>
                  {website ? (
                    <>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {website.name}
                      </p>
                      <p className="text-[11px] text-brand-500 font-medium">{website.domain}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">Unknown Web Source</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Calendar size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Date Submitted
                  </p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {new Date(contactData.createdAt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-navy-800 text-[10px] text-gray-400 dark:text-navy-500 flex items-center justify-between">
            <span>Submission ID:</span>
            <span className="font-mono">{contactData.id}</span>
          </div>
        </div>

        {/* Right Side: Conversation Flow (Message and Reply box) */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-navy-800 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-brand-500" size={20} />
              <h4 className="font-bold text-gray-900 dark:text-white">Conversation Hub</h4>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Interactive Chat/History Bubble Area */}
          <div className="flex-1 py-6 space-y-6 overflow-y-auto min-h-[220px]">
            {/* The Inquirer's Message Bubble */}
            <div className="flex flex-col items-start space-y-1">
              <span className="text-[10px] font-bold text-gray-400 dark:text-navy-400 ml-2">
                {contactData.fullName} • Inquiry Category:{' '}
                <span className="text-brand-500 font-semibold">{contactData.service}</span>
              </span>
              <div className="max-w-[85%] bg-brand-50/50 dark:bg-brand-500/5 text-gray-800 dark:text-gray-100 p-4 rounded-3xl rounded-tl-none border border-brand-100/30 dark:border-brand-500/10 shadow-sm text-sm whitespace-pre-wrap leading-relaxed relative">
                <span className="absolute -left-1.5 top-0 w-3 h-3 bg-brand-50/50 dark:bg-brand-500/5 border-l border-t border-brand-100/30 dark:border-brand-500/10 rotate-45"></span>
                {contactData.message}
              </div>
            </div>

            {/* The Saved Reply Bubble (if already replied) */}
            {contactData.status === ContactStatus.REPLIED && (
              <div className="flex flex-col items-end space-y-1">
                <span className="text-[10px] font-bold text-success-600 dark:text-success-400 mr-2 flex items-center gap-1">
                  <UserCheck size={12} />
                  Replied by{' '}
                  {repliedBy
                    ? `${repliedBy.firstName} ${repliedBy.lastName}`
                    : 'Administrator'} •{' '}
                  {contactData.repliedAt &&
                    new Date(contactData.repliedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </span>
                <div className="max-w-[85%] bg-success-50/50 dark:bg-success-500/5 text-gray-800 dark:text-gray-100 p-4 rounded-3xl rounded-tr-none border border-success-100/30 dark:border-success-500/10 shadow-sm text-sm whitespace-pre-wrap leading-relaxed relative">
                  <span className="absolute -right-1.5 top-0 w-3 h-3 bg-success-50/50 dark:bg-success-500/5 border-r border-t border-success-100/30 dark:border-success-500/10 -rotate-45"></span>
                  {contactData.replyMessage}
                </div>
              </div>
            )}
          </div>

          {/* Response Form Footer */}
          <div className="border-t border-gray-100 dark:border-navy-800 pt-4 shrink-0">
            {contactData.status === ContactStatus.PENDING ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <CornerUpLeft size={12} className="text-brand-500" />
                    Draft Response
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your reply response here..."
                    value={replyMessage}
                    onChange={(e) => {
                      setReplyMessage(e.target.value);
                      if (e.target.value.trim()) setError('');
                    }}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-950 dark:text-white bg-white dark:bg-navy-900 ${
                      error
                        ? 'border-error-500 focus:ring-error-500/20'
                        : 'border-gray-200 dark:border-navy-800'
                    }`}
                  />
                  {error && (
                    <p className="text-[11px] text-error-500 mt-1 font-semibold flex items-center gap-0.5">
                      <ShieldQuestion size={12} /> {error}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    className="shadow-lg shadow-brand-500/20 px-6 font-bold"
                    isLoading={isReplying}
                  >
                    Send Reply Message
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between p-4 bg-success-50/50 dark:bg-success-500/5 border border-success-100/30 dark:border-success-500/10 rounded-2xl animate-pulse-subtle">
                <div className="flex items-center gap-2.5 text-success-700 dark:text-success-400">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-semibold">
                    Response completed. This ticket is archived.
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                  Close Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
