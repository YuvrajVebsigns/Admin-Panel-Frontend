'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Contact, ContactStatus } from '../types/contact.types';
import { useContacts } from '../hooks/useContacts';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { Website } from '@/modules/websites/types/website.types';
import { Trash2, Globe, Calendar, Mail, Phone, CornerUpLeft, Eye } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

interface ContactTableProps {
  onViewDetails: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({ onViewDetails, onDelete }) => {
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    status?: ContactStatus;
    websiteId?: string;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { contacts, meta, isLoading } = useContacts(params);
  const { websites } = useWebsites({ limit: 100 });

  const getStatusColor = (
    status: ContactStatus,
  ): 'warning' | 'success' | 'primary' | 'error' | 'info' | 'light' | 'dark' => {
    switch (status) {
      case ContactStatus.REPLIED:
        return 'success';
      case ContactStatus.PENDING:
      default:
        return 'warning';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const first = parts[0]?.[0];
      const last = parts[parts.length - 1]?.[0];
      if (first && last) {
        return (first + last).toUpperCase();
      }
    }
    const first = parts[0]?.[0];
    return first ? first.toUpperCase() : '?';
  };

  const columns: Column<Contact>[] = [
    {
      header: 'Contact Person',
      accessor: (contact) => (
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shadow-sm border border-brand-100 dark:border-brand-500/20">
            {getInitials(contact.fullName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {contact.fullName}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
              <Mail size={12} className="text-gray-400" />
              {contact.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Message details',
      accessor: (contact) => (
        <div className="max-w-[280px]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-navy-300">
              {contact.service}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Phone size={10} />
              {contact.phone}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 italic">
            "{contact.message}"
          </p>
        </div>
      ),
    },
    {
      header: 'Website Source',
      accessor: (contact) => {
        const website = typeof contact.websiteId === 'object' ? contact.websiteId : null;
        return (
          <div className="min-w-0">
            {website ? (
              <>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {website.name}
                </p>
                <span className="text-xs text-brand-500 font-medium truncate flex items-center gap-0.5 mt-0.5">
                  <Globe size={12} />
                  {website.domain}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">Unknown Website</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Submitted At',
      accessor: (contact) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={13} className="text-gray-400 shrink-0" />
          <span>
            {new Date(contact.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (contact) => (
        <div className="flex items-center gap-1.5">
          <Badge
            color={getStatusColor(contact.status)}
            className="flex items-center gap-1 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg border-none shadow-sm"
          >
            {contact.status}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (contact) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onViewDetails(contact)}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
              contact.status === ContactStatus.PENDING
                ? 'text-brand-600 bg-brand-50 hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-500/10 dark:hover:bg-brand-500/20'
                : 'text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-navy-800'
            }`}
            title={
              contact.status === ContactStatus.PENDING ? 'Reply to inquiry' : 'View conversation'
            }
          >
            {contact.status === ContactStatus.PENDING ? (
              <CornerUpLeft size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-2 text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-xl transition-all"
            title="Delete contact submission"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: ContactStatus.PENDING, label: 'Pending Response' },
    { value: ContactStatus.REPLIED, label: 'Replied' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Premium Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-navy-950 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search inquiries by sender name, email, phone, message content..."
            value={params.search}
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={params.status || ''}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                status: (e.target.value as ContactStatus) || undefined,
                page: 1,
              }))
            }
            className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={params.websiteId || ''}
            onChange={(e) =>
              setParams((p) => ({ ...p, websiteId: e.target.value || undefined, page: 1 }))
            }
            className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer max-w-[200px]"
          >
            <option value="">All Websites</option>
            {websites.map((w: Website) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={contacts}
        columns={columns}
        isLoading={isLoading}
        serverSide
        totalItems={meta?.total}
        page={params.page}
        limit={params.limit}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
        onPageSizeChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
      />
    </div>
  );
};
