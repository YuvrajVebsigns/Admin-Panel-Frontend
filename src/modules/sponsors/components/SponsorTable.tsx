'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Sponsor, SponsorType, SponsorTier } from '../types/sponsor.types';
import { useSponsors } from '../hooks/useSponsors';
import { Edit, Trash2, Globe, Building2, User, Award, Eye } from 'lucide-react';
import Image from 'next/image';
import Badge from '@/components/ui/badge/Badge';
import { useRouter } from 'next/navigation';

interface SponsorTableProps {
  onEdit: (sponsor: Sponsor) => void;
  onDelete: (sponsor: Sponsor) => void;
}

export const SponsorTable: React.FC<SponsorTableProps> = ({ onEdit, onDelete }) => {
  const router = useRouter();
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    type?: SponsorType;
    tier?: SponsorTier;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { sponsors, meta, isLoading, updateSponsor } = useSponsors(params);

  const handleToggleActive = async (sponsor: Sponsor) => {
    try {
      await updateSponsor({ id: sponsor.id, data: { isActive: !sponsor.isActive } });
    } catch (error) {
      // Error handled by hook
    }
  };

  const getTierColor = (
    tier?: SponsorTier,
  ): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' => {
    switch (tier) {
      case SponsorTier.PLATINUM:
        return 'primary';
      case SponsorTier.GOLD:
        return 'warning'; // Amber
      case SponsorTier.SILVER:
        return 'light'; // Slate/Gray
      case SponsorTier.BRONZE:
        return 'error'; // Reddish/Orange
      case SponsorTier.PARTNER:
      default:
        return 'info'; // Blue
    }
  };

  const columns: Column<Sponsor>[] = [
    {
      header: 'Sponsor Profile',
      accessor: (sponsor) => {
        let logoUrl = '';
        if (typeof sponsor.logo === 'string') {
          logoUrl = sponsor.logo;
        } else if (sponsor.logo && typeof sponsor.logo === 'object') {
          logoUrl = sponsor.logo.thumbnail || sponsor.logo.original || '';
        }

        return (
          <div className="flex items-center gap-3.5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-gray-100 dark:border-navy-800 bg-gray-50 dark:bg-navy-950 flex items-center justify-center shadow-sm">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={sponsor.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-navy-600">
                  {sponsor.type === SponsorType.INDIVIDUAL ? (
                    <User size={22} />
                  ) : (
                    <Building2 size={22} />
                  )}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {sponsor.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-500 truncate">
                  {sponsor.companyName || 'Individual Sponsor'}
                </span>
                {sponsor.companyDomain && (
                  <>
                    <span className="text-[10px] text-gray-300">•</span>
                    <span className="text-xs text-brand-500 font-medium truncate flex items-center gap-0.5">
                      <Globe size={12} />
                      {sponsor.companyDomain}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Type & Classification',
      accessor: (sponsor) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {sponsor.type}
            </span>
          </div>
          {sponsor.designation && (
            <p className="text-[10px] text-gray-400 font-medium">{sponsor.designation}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Sponsor Tier',
      accessor: (sponsor) => (
        <div className="flex items-center gap-1.5">
          <Badge
            color={getTierColor(sponsor.tier)}
            className="flex items-center gap-1 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg border-none shadow-sm"
          >
            <Award size={12} />
            {sponsor.tier || 'PARTNER'}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Sort Order',
      accessor: (sponsor) => (
        <span className="text-sm font-semibold text-gray-500 dark:text-navy-400">
          {sponsor.sortOrder ?? 0}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (sponsor) => (
        <button
          onClick={() => handleToggleActive(sponsor)}
          className={`group relative overflow-hidden flex items-center justify-center px-4 py-1.5 rounded-xl font-bold text-[10px] tracking-wide uppercase transition-colors duration-300 ${
            sponsor.isActive
              ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400'
              : 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 hover:bg-success-50 hover:text-success-600 dark:hover:bg-success-500/10 dark:hover:text-success-400'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
            {sponsor.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0 whitespace-nowrap">
            {sponsor.isActive ? 'Deactivate' : 'Activate'}
          </span>
          <span className="invisible whitespace-nowrap">
            {sponsor.isActive ? 'Deactivate' : 'Activate'}
          </span>
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (sponsor) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => router.push(`/sponsors/${sponsor.id}`)}
            className="p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-all"
            title="View Sponsor"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit(sponsor)}
            className="p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-all"
            title="Edit Sponsor"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(sponsor)}
            className="p-2 text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-xl transition-all"
            title="Delete Sponsor"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: SponsorType.COMPANY, label: 'Company' },
    { value: SponsorType.INDIVIDUAL, label: 'Individual' },
    { value: SponsorType.COMPANY_UNIT, label: 'Company Unit' },
  ];

  const TIER_OPTIONS = [
    { value: '', label: 'All Tiers' },
    { value: SponsorTier.PLATINUM, label: 'Platinum' },
    { value: SponsorTier.GOLD, label: 'Gold' },
    { value: SponsorTier.SILVER, label: 'Silver' },
    { value: SponsorTier.BRONZE, label: 'Bronze' },
    { value: SponsorTier.PARTNER, label: 'Partner' },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Custom Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-navy-950 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search sponsors by name, company, domain, email..."
            value={params.search}
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={params.type || ''}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                type: (e.target.value as SponsorType) || undefined,
                page: 1,
              }))
            }
            className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={params.tier || ''}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                tier: (e.target.value as SponsorTier) || undefined,
                page: 1,
              }))
            }
            className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
          >
            {TIER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={sponsors}
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
