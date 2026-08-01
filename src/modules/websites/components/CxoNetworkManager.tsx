'use client';

import React, { useState } from 'react';
import { useCxoNetwork } from '../hooks/useCxoNetwork';
import { CxoNetworkMember } from '../types/cms.types';
import { DataTable } from '@/components/ui/table/DataTable';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import {
  Eye,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  UserCheck,
  Download,
  X,
  Filter,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface CxoNetworkManagerProps {
  siteId: string;
}

const CATEGORY_OPTIONS = [
  'All Categories',
  'Enterprise',
  'Startup',
  'Government',
  'Education',
  'Other',
];

const LinkedInIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export const CxoNetworkManager: React.FC<CxoNetworkManagerProps> = ({ siteId }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedMember, setSelectedMember] = useState<CxoNetworkMember | null>(null);

  const { user } = useAuthStore();
  const isSuperAdmin = user?.role?.roleKey === 'super_admin';

  const { members, meta, isLoading, deleteMember } = useCxoNetwork({
    websiteId: siteId,
    search: search || undefined,
    companyCategory: categoryFilter !== 'All Categories' ? categoryFilter : undefined,
    page,
    limit,
  });

  const handleDelete = async (id: string) => {
    if (
      confirm(
        'Are you sure you want to remove this member from CXO Capital Network? This action cannot be undone.',
      )
    ) {
      try {
        await deleteMember(id);
        if (selectedMember?.id === id) {
          setSelectedMember(null);
        }
      } catch (e) {}
    }
  };

  const handleExportCSV = () => {
    if (!members.length) return;

    const headers = [
      'First Name',
      'Last Name',
      'Title',
      'Designation',
      'Official Email',
      'Telephone No',
      'CIO Mobile Phone',
      'Company Name',
      'Category',
      'Business Vertical',
      'Address',
      'City',
      'State',
      'Postal Code',
      'Country',
      'LinkedIn Link',
      'Submitted Date',
    ];

    const rows = members.map((m) => [
      `"${m.firstName || ''}"`,
      `"${m.lastName || ''}"`,
      `"${m.title || ''}"`,
      `"${m.currentDesignation || ''}"`,
      `"${m.email || ''}"`,
      `"${m.telephoneNo || ''}"`,
      `"${m.cioMobilePhone || ''}"`,
      `"${m.companyName || ''}"`,
      `"${m.companyCategory || ''}"`,
      `"${m.businessVertical || ''}"`,
      `"${(m.companyAddress || '').replace(/"/g, '""')}"`,
      `"${m.city || ''}"`,
      `"${m.state || ''}"`,
      `"${m.postalCode || ''}"`,
      `"${m.country || ''}"`,
      `"${m.linkedInLink || ''}"`,
      `"${new Date(m.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `cxo_capital_network_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'Enterprise':
        return 'primary';
      case 'Startup':
        return 'success';
      case 'Government':
        return 'warning';
      case 'Education':
        return 'info';
      default:
        return 'light';
    }
  };

  const columns = [
    {
      header: 'MEMBER & DESIGNATION',
      accessor: (item: CxoNetworkMember) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white">
              {item.title ? `${item.title} ` : ''}
              {item.firstName} {item.lastName}
            </span>
            {item.linkedInLink && (
              <a
                href={item.linkedInLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="View LinkedIn Profile"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
            {item.currentDesignation}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Building2 size={12} /> {item.companyName}
          </span>
        </div>
      ),
    },
    {
      header: 'CONTACT INFO',
      accessor: (item: CxoNetworkMember) => (
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
            <Mail size={12} className="text-gray-400" /> {item.email}
          </span>
          {(item.cioMobilePhone || item.telephoneNo) && (
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Phone size={12} className="text-gray-400" />{' '}
              {item.cioMobilePhone || item.telephoneNo}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'CATEGORY & VERTICAL',
      accessor: (item: CxoNetworkMember) => (
        <div className="flex flex-col gap-1 items-start">
          <Badge color={getCategoryColor(item.companyCategory)}>
            {item.companyCategory || 'Other'}
          </Badge>
          {item.businessVertical && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {item.businessVertical}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'LOCATION',
      accessor: (item: CxoNetworkMember) => (
        <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
          <MapPin size={13} className="text-gray-400" />
          <span>{[item.city, item.state, item.country].filter(Boolean).join(', ') || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'SUBMITTED AT',
      accessor: (item: CxoNetworkMember) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: (item: CxoNetworkMember) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedMember(item)}
            title="View Full Profile Details"
            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-navy-900 rounded-lg transition-colors border-none bg-transparent"
          >
            <Eye size={16} />
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => handleDelete(item.id)}
              title="Delete Network Member"
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors border-none bg-transparent"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls & Category Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-navy-900/30 p-4 rounded-2xl border border-gray-100 dark:border-navy-700">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2 w-full bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-500/20 outline-none"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden sm:inline">
            Total: {meta?.total || 0} Members
          </span>
        </div>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={!members.length}
          className="w-full md:w-auto bg-white dark:bg-navy-800"
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Network Data Table */}
      <DataTable<CxoNetworkMember>
        data={members}
        columns={columns}
        isLoading={isLoading}
        serverSide={true}
        totalItems={meta?.total || 0}
        page={page}
        limit={limit}
        search={search}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, company, designation or city..."
      />

      {/* Profile Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-navy-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-navy-700 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg">
                  {selectedMember.firstName.charAt(0)}
                  {selectedMember.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {selectedMember.title ? `${selectedMember.title} ` : ''}
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h3>
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {selectedMember.currentDesignation} @ {selectedMember.companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl transition-colors bg-transparent border-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Professional Overview Card */}
              <div className="p-4 bg-gray-50 dark:bg-navy-900/50 rounded-2xl space-y-3 border border-gray-100 dark:border-navy-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Briefcase size={14} /> Professional & Company Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 block">Designation</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMember.currentDesignation}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Company Name</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMember.companyName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Company Category</span>
                    <Badge color={getCategoryColor(selectedMember.companyCategory)}>
                      {selectedMember.companyCategory || 'Other'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Business Vertical</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMember.businessVertical || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Details Card */}
              <div className="p-4 bg-gray-50 dark:bg-navy-900/50 rounded-2xl space-y-3 border border-gray-100 dark:border-navy-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Mail size={14} /> Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 block">Official Email</span>
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      {selectedMember.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">CIO Mobile Phone</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMember.cioMobilePhone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Telephone No</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMember.telephoneNo || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">LinkedIn Profile</span>
                    {selectedMember.linkedInLink ? (
                      <a
                        href={selectedMember.linkedInLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <LinkedInIcon className="w-3.5 h-3.5" /> Profile Link
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="p-4 bg-gray-50 dark:bg-navy-900/50 rounded-2xl space-y-3 border border-gray-100 dark:border-navy-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <MapPin size={14} /> Address & Location
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <span className="text-xs text-gray-400 block">Company Address</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMember.companyAddress || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">City</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMember.city || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">State</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMember.state || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Postal / ZIP Code</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMember.postalCode || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Country</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedMember.country || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked System Details */}
              <div className="p-4 bg-gray-50 dark:bg-navy-900/50 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-navy-700">
                <div className="flex items-center gap-2">
                  <UserCheck size={18} className="text-emerald-500" />
                  <div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                      Linked Registree Account
                    </span>
                    <span className="text-xs text-gray-400">
                      Saved in central registrees collection
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  Submitted: {new Date(selectedMember.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900/50 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
