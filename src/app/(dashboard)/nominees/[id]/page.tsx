'use client';

import React, { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { registreeService } from '@/services/registree.service';
import { useNominations } from '@/modules/nominations/hooks/useNominations';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import {
  NominationStatus,
  RegistreeRef,
  WebsiteRef,
  NomineeEntry,
} from '@/modules/nominations/types/nomination.types';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Globe,
  Briefcase,
  MapPin,
  Award,
  Search,
  Filter,
  X,
  RotateCcw,
  ExternalLink,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  User,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NomineeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<NominationStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeDatePreset, setActiveDatePreset] = useState<string>('all');

  // Fetch Websites for website filter dropdown
  const { websites } = useWebsites({ limit: 100 });

  // Fetch Nominee Profile
  const { data: registree, isLoading: isRegistreeLoading } = useQuery({
    queryKey: ['registree', id],
    queryFn: () => registreeService.getRegistreeById(id),
    retry: 1,
  });

  // Fetch Nominations for this nominee
  const {
    nominations,
    isLoading: isNominationsLoading,
    error: nominationsError,
    updateStatus,
    isUpdatingStatus,
  } = useNominations({
    nomineeId: id,
    websiteId: selectedWebsite || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: searchQuery ? searchQuery.trim() : undefined,
    status: selectedStatus || undefined,
    limit: 100,
  });

  // Status Colors for Badges and Selects
  const STATUS_COLORS: Record<NominationStatus, string> = {
    [NominationStatus.PENDING]:
      'bg-warning-50 text-warning-600 border-warning-200 dark:bg-warning-500/10 dark:text-warning-500 dark:border-warning-500/20',
    [NominationStatus.REVIEWED]:
      'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-500 dark:border-blue-500/20',
    [NominationStatus.APPROVED]:
      'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-500 dark:border-success-500/20',
    [NominationStatus.REJECTED]:
      'bg-error-50 text-error-600 border-error-200 dark:bg-error-500/10 dark:text-error-500 dark:border-error-500/20',
  };

  const getStatusIcon = (status: NominationStatus) => {
    switch (status) {
      case NominationStatus.APPROVED:
        return <CheckCircle2 size={13} className="text-success-500" />;
      case NominationStatus.REJECTED:
        return <XCircle size={13} className="text-error-500" />;
      case NominationStatus.REVIEWED:
        return <Clock size={13} className="text-blue-500" />;
      case NominationStatus.PENDING:
      default:
        return <AlertCircle size={13} className="text-warning-500" />;
    }
  };

  // Helper for Name Initials
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const first = parts[0]?.[0];
      const last = parts[parts.length - 1]?.[0];
      if (first && last) return (first + last).toUpperCase();
    }
    return (parts[0]?.[0] || '?').toUpperCase();
  };

  // Quick Date Range Preset Handler
  const handleDatePreset = (preset: string) => {
    setActiveDatePreset(preset);
    const now = new Date();
    const toDateString = (d: Date): string => d.toISOString().slice(0, 10);

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    if (preset === '7days') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      setStartDate(toDateString(past));
      setEndDate(toDateString(now));
      return;
    }

    if (preset === '30days') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      setStartDate(toDateString(past));
      setEndDate(toDateString(now));
      return;
    }

    if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(toDateString(firstDay));
      setEndDate(toDateString(now));
      return;
    }

    if (preset === 'thisYear') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      setStartDate(toDateString(firstDay));
      setEndDate(toDateString(now));
      return;
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedWebsite('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setActiveDatePreset('all');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedWebsite) ||
    Boolean(selectedStatus) ||
    Boolean(startDate) ||
    Boolean(endDate);

  // Status update handler
  const handleUpdateStatus = async (nominationId: string, status: NominationStatus) => {
    try {
      await updateStatus({
        id: nominationId,
        data: { status },
      });
      toast.success(`Nomination status updated to ${status}`);
    } catch {
      // Handled by react query toast
    }
  };

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    const list = nominations || [];
    const total = list.length;
    const approved = list.filter((n) => n.status === NominationStatus.APPROVED).length;
    const pending = list.filter((n) => n.status === NominationStatus.PENDING).length;
    const reviewed = list.filter((n) => n.status === NominationStatus.REVIEWED).length;

    // Unique nominators count
    const nominatorIds = new Set<string>();
    list.forEach((n) => {
      const nomId =
        typeof n.nominatorId === 'object' ? n.nominatorId?.id || n.nominatorId?._id : n.nominatorId;
      if (nomId) nominatorIds.add(String(nomId));
    });

    // Unique categories
    const categoriesSet = new Set<string>();
    list.forEach((n) => {
      n.nominees?.forEach((entry) => {
        const catName =
          typeof entry.categoryId === 'object' && entry.categoryId
            ? (entry.categoryId as { name?: string }).name
            : entry.category;
        if (catName) categoriesSet.add(catName);
      });
    });

    return {
      total,
      approved,
      pending,
      reviewed,
      uniqueNominators: nominatorIds.size,
      categoriesCount: categoriesSet.size,
    };
  }, [nominations]);

  // Derive nominee details from registree or first nomination
  const nomineeProfile = useMemo(() => {
    const firstNom = nominations?.[0];
    const nomineeEntry = firstNom?.nominees?.find((entry) => {
      const eNomId =
        typeof entry.nomineeId === 'object'
          ? entry.nomineeId?.id || entry.nomineeId?._id
          : entry.nomineeId;
      return String(eNomId) === String(id);
    });
    const embeddedRef =
      typeof nomineeEntry?.nomineeId === 'object' ? (nomineeEntry.nomineeId as RegistreeRef) : null;

    return {
      name: registree?.name || nomineeEntry?.contactName || embeddedRef?.name || 'CIO Nominee',
      email: registree?.email || nomineeEntry?.contactEmail || embeddedRef?.email || 'N/A',
      organization:
        registree?.organization ||
        nomineeEntry?.companyName ||
        embeddedRef?.organization ||
        'No Organization',
      phoneNumber:
        registree?.phoneNumber || nomineeEntry?.mobileNo || embeddedRef?.phoneNumber || '-',
      city: registree?.city || embeddedRef?.city || '-',
      countryCode: registree?.countryCode || embeddedRef?.countryCode || '',
      joinedAt: registree?.joinedAt || registree?.createdAt || firstNom?.submittedAt,
    };
  }, [registree, nominations, id]);

  const isLoading = isRegistreeLoading && isNominationsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading nominee profile and nomination submissions...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      {/* Top Header / Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/nominees"
            className="p-2.5 bg-white dark:bg-navy-900 rounded-2xl border border-gray-200 dark:border-navy-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm hover:shadow"
            title="Back to Nominees Directory"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CIO Nominee View</h1>
              <Badge color="primary" variant="light" className="text-xs font-bold uppercase">
                Nominee Profile
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Reviewing nominee profile and all nominators who nominated{' '}
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {nomineeProfile.name}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/nominees')}
            className="rounded-2xl"
          >
            Back to Directory
          </Button>
        </div>
      </div>

      {/* Main Grid: Nominee Profile & Metrics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Nominee Profile Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm p-6 relative overflow-hidden">
            {/* Header background accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-500 to-indigo-600" />

            <div className="flex items-center gap-4 mb-6 pt-2">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xl shadow-inner border border-brand-100 dark:border-brand-500/20">
                {getInitials(nomineeProfile.name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {nomineeProfile.name}
                </h2>
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 truncate">
                  {nomineeProfile.organization}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-success-500" />
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    Active CIO Nominee
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details List */}
            <div className="space-y-4 border-t border-gray-100 dark:border-navy-800 pt-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Email Address
                  </p>
                  <a
                    href={`mailto:${nomineeProfile.email}`}
                    className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-600 truncate block transition-colors"
                  >
                    {nomineeProfile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shrink-0">
                  <Briefcase size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Company / Organization
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {nomineeProfile.organization}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shrink-0">
                  <Phone size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Phone Number
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {nomineeProfile.countryCode ? `${nomineeProfile.countryCode} ` : ''}
                    {nomineeProfile.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Location / City
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {nomineeProfile.city}
                  </p>
                </div>
              </div>

              {nomineeProfile.joinedAt && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                      First Nominated
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {new Date(nomineeProfile.joinedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Key Metrics Ribbon */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Total Nominations
                </span>
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Award size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {metrics.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">Submissions received</p>
            </div>

            <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Unique Nominators
                </span>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <User size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {metrics.uniqueNominators}
              </p>
              <p className="text-xs text-gray-500 mt-1">Individual peers</p>
            </div>

            <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Approved
                </span>
                <div className="p-2 bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 rounded-xl">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-success-600 dark:text-success-400">
                {metrics.approved}
              </p>
              <p className="text-xs text-gray-500 mt-1">Verified submissions</p>
            </div>

            <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Pending / Review
                </span>
                <div className="p-2 bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400 rounded-xl">
                  <Clock size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-warning-600 dark:text-warning-400">
                {metrics.pending + metrics.reviewed}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting decision</p>
            </div>
          </div>

          {/* Banner explaining Snapshot data */}
          <div className="bg-gradient-to-r from-brand-50 to-indigo-50/50 dark:from-navy-800/80 dark:to-navy-900/80 border border-brand-100 dark:border-navy-700/60 rounded-3xl p-5 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-md shrink-0">
              <Camera size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Point-in-Time Nominator Snapshot Data
                <Badge color="primary" variant="light" className="text-[10px] font-bold">
                  Immutable Record
                </Badge>
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                Each nomination card below contains the <strong>exact details</strong> submitted by
                the nominator at the moment of submission (Name, Email, Company, City, and Phone).
                This ensures complete audit fidelity, regardless of future updates to their CRM
                profiles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR SECTION */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-navy-800">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-brand-500" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Filter Nominations
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300">
              {nominations.length} {nominations.length === 1 ? 'card' : 'cards'}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1.5 transition-colors self-start md:self-auto"
            >
              <RotateCcw size={13} />
              Reset All Filters
            </button>
          )}
        </div>

        {/* Filters Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Bar for specific nominator nomination card */}
          <div className="md:col-span-4 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search nominator by name, email, company, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Website Source Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedWebsite}
              onChange={(e) => setSelectedWebsite(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="">All Source Websites</option>
              {websites?.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.domain})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as NominationStatus | '')}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value={NominationStatus.PENDING}>Pending</option>
              <option value={NominationStatus.REVIEWED}>Reviewed</option>
              <option value={NominationStatus.APPROVED}>Approved</option>
              <option value={NominationStatus.REJECTED}>Rejected</option>
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="md:col-span-3 flex items-center gap-2">
            <div className="flex-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActiveDatePreset('custom');
                }}
                className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                title="Start Date"
              />
            </div>
            <span className="text-gray-400 text-xs font-semibold">to</span>
            <div className="flex-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActiveDatePreset('custom');
                }}
                className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                title="End Date"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setActiveDatePreset('all');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800"
                title="Clear Dates"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Date Presets Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            Quick Dates:
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'thisMonth', label: 'This Month' },
            { id: 'thisYear', label: 'This Year' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleDatePreset(preset.id)}
              className={`text-xs font-semibold px-3 py-1 rounded-xl transition-all ${
                activeDatePreset === preset.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* NOMINATOR NOMINATION CARDS LIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award size={20} className="text-brand-500" />
            Nominator Submissions
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({nominations.length} {nominations.length === 1 ? 'submission' : 'submissions'})
            </span>
          </h2>
        </div>

        {nominationsError ? (
          <div className="p-8 text-center bg-white dark:bg-navy-900 rounded-3xl border border-error-100 dark:border-error-900/30">
            <AlertCircle size={36} className="text-error-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-error-600">Failed to load nominations</p>
            <p className="text-xs text-gray-500 mt-1">Please try refreshing the page.</p>
          </div>
        ) : nominations.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-gray-50 dark:bg-navy-800 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
              <Award size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No Nomination Cards Found
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'No nomination submissions match your active filter criteria. Try adjusting dates, website source, or search keyword.'
                  : 'No nominations have been recorded for this CIO nominee yet.'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="rounded-2xl"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {nominations.map((nomination, index) => {
              const nominator =
                typeof nomination.nominatorId === 'object'
                  ? (nomination.nominatorId as RegistreeRef)
                  : null;
              const nominatorRouteId =
                nominator?.id ||
                nominator?._id ||
                (typeof nomination.nominatorId === 'string' ? nomination.nominatorId : '');

              const website =
                typeof nomination.websiteId === 'object'
                  ? (nomination.websiteId as WebsiteRef)
                  : null;

              // Find the specific nominee entry inside this nomination
              const thisNomineeEntry = nomination.nominees?.find((entry: NomineeEntry) => {
                const eNomId =
                  typeof entry.nomineeId === 'object'
                    ? entry.nomineeId?.id || entry.nomineeId?._id
                    : entry.nomineeId;
                return String(eNomId) === String(id);
              });

              // Snapshot values with fallbacks to nominator profile
              const snapshotName =
                nomination.nominatorSnapshot?.name || nominator?.name || 'Unknown Nominator';
              const snapshotEmail =
                nomination.nominatorSnapshot?.email || nominator?.email || 'N/A';
              const snapshotCompany =
                nomination.nominatorSnapshot?.company || nominator?.organization || 'Not Provided';
              const snapshotCity =
                nomination.nominatorSnapshot?.city || nominator?.city || 'Not Provided';
              const snapshotPhone =
                nomination.nominatorSnapshot?.phone || nominator?.phoneNumber || 'Not Provided';

              // Category info
              const categoryName =
                typeof thisNomineeEntry?.categoryId === 'object' && thisNomineeEntry.categoryId
                  ? (thisNomineeEntry.categoryId as { name?: string }).name
                  : thisNomineeEntry?.category || 'General';

              const subCategoryName =
                typeof thisNomineeEntry?.subCategoryId === 'object' &&
                thisNomineeEntry.subCategoryId
                  ? (thisNomineeEntry.subCategoryId as { name?: string }).name
                  : null;

              return (
                <div
                  key={nomination.id || `nom-${index}`}
                  className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Card Header Bar */}
                  <div className="px-6 py-4 bg-gray-50/70 dark:bg-navy-950/70 border-b border-gray-100 dark:border-navy-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-xl border border-brand-100 dark:border-brand-500/20">
                        #{index + 1}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={14} className="text-gray-400" />
                        <span>
                          {new Date(nomination.submittedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {website ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-navy-900 px-3 py-1 rounded-xl border border-gray-200 dark:border-navy-700 shadow-2xs">
                          <Globe size={13} className="text-brand-500" />
                          <span>{website.name}</span>
                          <span className="text-[11px] text-gray-400 font-normal">
                            ({website.domain})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-navy-800 px-2.5 py-1 rounded-xl">
                          Manual / Direct Entry
                        </span>
                      )}
                    </div>

                    {/* Status & Quick Status Update */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Status:
                      </span>
                      <div className="relative inline-flex items-center">
                        <select
                          value={nomination.status}
                          onChange={(e) =>
                            handleUpdateStatus(nomination.id, e.target.value as NominationStatus)
                          }
                          disabled={isUpdatingStatus}
                          className={`text-xs font-bold uppercase tracking-wider pl-7 pr-3 py-1.5 rounded-xl border cursor-pointer transition-all ${STATUS_COLORS[nomination.status]}`}
                        >
                          <option value={NominationStatus.PENDING}>PENDING</option>
                          <option value={NominationStatus.REVIEWED}>REVIEWED</option>
                          <option value={NominationStatus.APPROVED}>APPROVED</option>
                          <option value={NominationStatus.REJECTED}>REJECTED</option>
                        </select>
                        <div className="absolute left-2 pointer-events-none">
                          {getStatusIcon(nomination.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-6">
                    {/* POINT-IN-TIME NOMINATOR SNAPSHOT SECTION */}
                    <div className="bg-amber-50/40 dark:bg-navy-800/40 border border-amber-200/60 dark:border-navy-700 rounded-2xl p-5 relative">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-sm">
                            <Camera size={14} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                              Nominator Snapshot Data
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Point-in-time snapshot captured during this submission
                            </p>
                          </div>
                        </div>

                        {nominatorRouteId && (
                          <Link
                            href={`/nominators/${nominatorRouteId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 bg-white dark:bg-navy-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-navy-700 shadow-2xs hover:shadow transition-all"
                            title="View nominator full history & submissions"
                          >
                            <span>View Full Nominator Profile</span>
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>

                      {/* Snapshot Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-xl border border-gray-100 dark:border-navy-800 shadow-2xs">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Nominator Name
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 truncate">
                            {snapshotName}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-xl border border-gray-100 dark:border-navy-800 shadow-2xs">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Snapshot Email
                          </p>
                          <p
                            className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 truncate"
                            title={snapshotEmail}
                          >
                            {snapshotEmail}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-xl border border-gray-100 dark:border-navy-800 shadow-2xs">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Snapshot Company
                          </p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 truncate">
                            {snapshotCompany}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-xl border border-gray-100 dark:border-navy-800 shadow-2xs">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Snapshot City
                          </p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 truncate">
                            {snapshotCity}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-xl border border-gray-100 dark:border-navy-800 shadow-2xs">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Snapshot Phone
                          </p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 truncate">
                            {snapshotPhone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* NOMINATION SPECIFIC CATEGORY & SUBMISSION DETAILS */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-brand-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Category:
                          </span>
                          <Badge
                            color="info"
                            variant="light"
                            className="font-bold text-xs rounded-xl px-3 py-1"
                          >
                            {categoryName}
                          </Badge>
                        </div>

                        {subCategoryName && (
                          <div className="flex items-center gap-2">
                            <Layers size={15} className="text-indigo-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                              Sub Category:
                            </span>
                            <Badge
                              color="light"
                              className="font-semibold text-xs rounded-xl px-3 py-1 border border-gray-200 dark:border-navy-700"
                            >
                              {subCategoryName}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* If custom contact details were supplied for this nominee in the submission */}
                      {(thisNomineeEntry?.contactName || thisNomineeEntry?.companyName) && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3 bg-gray-50 dark:bg-navy-950 px-3.5 py-1.5 rounded-xl border border-gray-100 dark:border-navy-800">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Nominated As:
                          </span>
                          <span>{thisNomineeEntry.contactName || nomineeProfile.name}</span>
                          {thisNomineeEntry.companyName && (
                            <>
                              <span>•</span>
                              <span>{thisNomineeEntry.companyName}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
