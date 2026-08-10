'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { useSubscribes } from '../hooks/useSubscribes';
import { Subscribe } from '../types/subscribe.types';
import { Calendar, Globe, Mail } from 'lucide-react';

export const SubscribeTable: React.FC = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { subscribes, meta, isLoading } = useSubscribes({
    page: params.page,
    limit: params.limit,
    search: params.search,
    sort: 'createdAt:desc',
  });

  const columns: Column<Subscribe>[] = [
    {
      header: 'Subscriber',
      accessor: (item) => (
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
            <Mail size={12} /> {item.email}
          </span>
        </div>
      ),
    },
    {
      header: 'Source',
      accessor: (item) => {
        const website = typeof item.websiteId === 'object' ? item.websiteId : null;
        return website ? (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {website.name}
            </p>
            <span className="text-xs text-brand-500 font-medium truncate flex items-center gap-1 mt-0.5">
              <Globe size={12} /> {website.domain}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Direct / Unknown</span>
        );
      },
    },
    {
      header: 'Subscribed At',
      accessor: (item) => {
        const dateValue = item.subscribedAt || item.createdAt || item.updatedAt;
        const date = dateValue ? new Date(dateValue) : null;
        const isValidDate = date instanceof Date && !isNaN(date.getTime());

        return (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={13} className="text-gray-400 shrink-0" />
            <span>
              {isValidDate
                ? date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Unknown date'}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-navy-950 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search subscribers by email or name..."
            value={params.search}
            onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      <DataTable
        data={subscribes}
        columns={columns}
        isLoading={isLoading}
        serverSide
        totalItems={meta?.total}
        page={params.page}
        limit={params.limit}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        onPageSizeChange={(limit) => setParams((prev) => ({ ...prev, limit, page: 1 }))}
      />
    </div>
  );
};
