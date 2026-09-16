'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import {
  Nomination,
  GroupedNominee,
  GroupedNominator,
  NominationStatus,
  NominationCategory,
  NominationSubCategory,
  NomineeEntry,
} from '@/modules/nominations/types/nomination.types';
import {
  useNominations,
  useGroupedNominees,
  useGroupedNominators,
} from '@/modules/nominations/hooks/useNominations';
import {
  useNominationCategories,
  useNominationSubCategories,
} from '@/modules/nominations/hooks/useNominationCategories';
import { Website } from '@/modules/websites/types/website.types';
import {
  Mail,
  Briefcase,
  Award,
  Eye,
  FileSpreadsheet,
  Calendar,
  Layers,
  Users,
  Trophy,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  MapPin,
  Building2,
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { ExportDataModal } from '@/modules/nominations/components/ExportDataModal';
import { nominationService } from '@/services/nomination.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export interface TableHeadings {
  presetName: string;
  nomineeCompany: string;
  nomineeContact: string;
  nomineeEmail: string;
  nomineePhone: string;
  category: string;
  subCategory: string;
  nominatorName: string;
  nominatorCompany: string;
  nominatorEmail: string;
  nominatorCity: string;
  status: string;
  date: string;
  votesCount: string;
  entriesLabel: string;
}

export function resolveWebsiteTableHeadings(website?: Website): TableHeadings {
  const slug = website?.slug?.toLowerCase() || '';
  const name = website?.name?.toLowerCase() || '';

  // 1. Check custom overrides from website settings if available
  const customHeadings = website?.settings?.votingTableHeadings;
  const customMap = new Map<string, string>();
  if (Array.isArray(customHeadings)) {
    customHeadings.forEach((h) => {
      if (h && h.enabled && h.label) {
        customMap.set(h.key, h.label);
      }
    });
  }

  // 2. Derive base platform-specific headings
  let base: TableHeadings;
  if (slug.includes('choice') || name.includes('choice')) {
    base = {
      presetName: 'CIO Choice Platform',
      nomineeCompany: 'ICT Vendor / Provider',
      nomineeContact: 'Vendor Contact Person',
      nomineeEmail: 'Vendor Email',
      nomineePhone: 'Contact Number',
      category: 'ICT Category',
      subCategory: 'Solution / Sub-Category',
      nominatorName: 'CIO / Voter Name',
      nominatorCompany: 'CIO Enterprise / Organization',
      nominatorEmail: 'CIO Email',
      nominatorCity: 'City / Region',
      status: 'Status',
      date: 'Submitted Date',
      votesCount: 'CIO Votes',
      entriesLabel: 'CIO Votes / Submissions',
    };
  } else if (slug.includes('powerlist') || name.includes('powerlist')) {
    base = {
      presetName: 'CIO Powerlist Platform',
      nomineeCompany: 'Nominee Organization',
      nomineeContact: 'Nominated CIO / Leader',
      nomineeEmail: 'Leader Email',
      nomineePhone: 'Leader Mobile',
      category: 'Powerlist Category',
      subCategory: 'Specialization / Domain',
      nominatorName: 'Recommended By',
      nominatorCompany: 'Nominator Organization',
      nominatorEmail: 'Nominator Email',
      nominatorCity: 'Location',
      status: 'Nomination Status',
      date: 'Submitted Date',
      votesCount: 'Recommendations',
      entriesLabel: 'Powerlist Submissions',
    };
  } else if (slug.includes('crown') || name.includes('crown')) {
    base = {
      presetName: 'CIO Crown Platform',
      nomineeCompany: 'Nominee Enterprise',
      nomineeContact: 'Crown Nominee',
      nomineeEmail: 'Nominee Email',
      nomineePhone: 'Nominee Phone',
      category: 'Crown Category',
      subCategory: 'Category Stream',
      nominatorName: 'Proposer / Nominator',
      nominatorCompany: 'Proposer Enterprise',
      nominatorEmail: 'Proposer Email',
      nominatorCity: 'City',
      status: 'Status',
      date: 'Submitted Date',
      votesCount: 'Nominations',
      entriesLabel: 'Crown Submissions',
    };
  } else if (slug.includes('cxo') || name.includes('cxo')) {
    base = {
      presetName: 'CXO Capital Platform',
      nomineeCompany: 'Venture / Enterprise',
      nomineeContact: 'CXO Leader Name',
      nomineeEmail: 'Contact Email',
      nomineePhone: 'Contact Phone',
      category: 'Award Category',
      subCategory: 'Focus Sector',
      nominatorName: 'Nominator / Partner',
      nominatorCompany: 'Organization / Firm',
      nominatorEmail: 'Contact Email',
      nominatorCity: 'Location',
      status: 'Status',
      date: 'Submitted Date',
      votesCount: 'Submissions',
      entriesLabel: 'CXO Submissions',
    };
  } else {
    base = {
      presetName: 'Standard Platform',
      nomineeCompany: 'Nominee Company / Organization',
      nomineeContact: 'Nominee Contact Person',
      nomineeEmail: 'Contact Email',
      nomineePhone: 'Phone Number',
      category: 'Category',
      subCategory: 'Sub-Category',
      nominatorName: 'Nominator Name',
      nominatorCompany: 'Nominator Company',
      nominatorEmail: 'Nominator Email',
      nominatorCity: 'City / Location',
      status: 'Status',
      date: 'Submitted Date',
      votesCount: 'Nominations',
      entriesLabel: 'Nomination Submissions',
    };
  }

  // 3. Apply custom configured heading overrides
  if (customMap.has('companyName')) base.nomineeCompany = customMap.get('companyName')!;
  if (customMap.has('contactName')) base.nomineeContact = customMap.get('contactName')!;
  if (customMap.has('contactEmail')) base.nomineeEmail = customMap.get('contactEmail')!;
  if (customMap.has('mobileNo')) base.nomineePhone = customMap.get('mobileNo')!;
  if (customMap.has('category')) base.category = customMap.get('category')!;
  if (customMap.has('subCategory')) base.subCategory = customMap.get('subCategory')!;

  return base;
}

interface WebsiteNominationSubmissionsTableProps {
  websiteId: string;
  website?: Website;
}

type ViewMode = 'submissions' | 'nominees' | 'nominators';

export const WebsiteNominationSubmissionsTable: React.FC<
  WebsiteNominationSubmissionsTableProps
> = ({ websiteId, website }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const headings = useMemo(() => resolveWebsiteTableHeadings(website), [website]);

  const [viewMode, setViewMode] = useState<ViewMode>('submissions');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Nomination | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<NominationStatus | ''>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subCategoryId, setSubCategoryId] = useState<string>('');

  // Queries
  const {
    nominations,
    meta: nominationsMeta,
    isLoading: isNominationsLoading,
  } = useNominations({
    websiteId,
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    categoryId: categoryId || undefined,
    subCategoryId: subCategoryId || undefined,
  });

  const {
    nominees: groupedNominees,
    meta: nomineesMeta,
    isLoading: isNomineesLoading,
  } = useGroupedNominees({
    websiteId,
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
  });

  const {
    nominators: groupedNominators,
    meta: nominatorsMeta,
    isLoading: isNominatorsLoading,
  } = useGroupedNominators({
    websiteId,
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
  });

  // Category Lookups
  const { categories } = useNominationCategories({ websiteId, limit: 500, isActive: true });
  const { subCategories } = useNominationSubCategories({
    websiteId,
    limit: 500,
    isActive: true,
    categoryId: categoryId || undefined,
  });

  const categoryMap = useMemo(() => {
    const map = new Map<string, NominationCategory>();
    categories.forEach((c) => {
      const id = c.id || c._id;
      if (id) map.set(id, c);
    });
    return map;
  }, [categories]);

  const subCategoryMap = useMemo(() => {
    const map = new Map<string, NominationSubCategory>();
    subCategories.forEach((s) => {
      const id = s.id || s._id;
      if (id) map.set(id, s);
    });
    return map;
  }, [subCategories]);

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: NominationStatus }) =>
      nominationService.updateNominationStatus(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominations'] });
      queryClient.invalidateQueries({ queryKey: ['nominees', 'grouped'] });
      queryClient.invalidateQueries({ queryKey: ['nominators', 'grouped'] });
      toast.success('Submission status updated successfully');
      if (selectedSubmission) {
        setSelectedSubmission((prev) => (prev ? { ...prev, status: prev.status } : null));
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update status');
    },
  });

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

  const getStatusBadge = (st: NominationStatus) => {
    switch (st) {
      case NominationStatus.APPROVED:
        return (
          <Badge
            color="success"
            variant="light"
            startIcon={<CheckCircle2 size={12} />}
            className="font-semibold text-xs px-2.5 py-1 rounded-lg"
          >
            Approved
          </Badge>
        );
      case NominationStatus.REVIEWED:
        return (
          <Badge
            color="info"
            variant="light"
            startIcon={<Clock size={12} />}
            className="font-semibold text-xs px-2.5 py-1 rounded-lg"
          >
            Reviewed
          </Badge>
        );
      case NominationStatus.REJECTED:
        return (
          <Badge
            color="error"
            variant="light"
            startIcon={<XCircle size={12} />}
            className="font-semibold text-xs px-2.5 py-1 rounded-lg"
          >
            Rejected
          </Badge>
        );
      case NominationStatus.PENDING:
      default:
        return (
          <Badge
            color="warning"
            variant="light"
            startIcon={<AlertCircle size={12} />}
            className="font-semibold text-xs px-2.5 py-1 rounded-lg"
          >
            Pending
          </Badge>
        );
    }
  };

  const getNominatorName = (item: Nomination): string => {
    if (item.nominatorId && typeof item.nominatorId === 'object') {
      return item.nominatorId.name || 'N/A';
    }
    return item.nominatorSnapshot?.name || 'N/A';
  };

  const getNominatorEmail = (item: Nomination): string => {
    if (item.nominatorId && typeof item.nominatorId === 'object') {
      return item.nominatorId.email || '';
    }
    return item.nominatorSnapshot?.email || '';
  };

  const getNominatorCompany = (item: Nomination): string => {
    if (item.nominatorId && typeof item.nominatorId === 'object') {
      return item.nominatorId.organization || '-';
    }
    return item.nominatorSnapshot?.company || '-';
  };

  const getNominatorCity = (item: Nomination): string => {
    if (item.nominatorId && typeof item.nominatorId === 'object') {
      return item.nominatorId.city || '-';
    }
    return item.nominatorSnapshot?.city || '-';
  };

  const getNomineeCategoryName = (nominee: NomineeEntry): string => {
    if (nominee.categoryId && typeof nominee.categoryId === 'object') {
      return nominee.categoryId.name || 'Category';
    }
    if (typeof nominee.categoryId === 'string') {
      const cat = categoryMap.get(nominee.categoryId);
      if (cat) return cat.name;
    }
    return nominee.category || '-';
  };

  const getNomineeSubCategoryName = (nominee: NomineeEntry): string => {
    if (nominee.subCategoryId && typeof nominee.subCategoryId === 'object') {
      return nominee.subCategoryId.name || '';
    }
    if (typeof nominee.subCategoryId === 'string') {
      const sub = subCategoryMap.get(nominee.subCategoryId);
      if (sub) return sub.name;
    }
    return '';
  };

  // -------------------------------------------------------------
  // Columns Definition: VIEW 1 - ALL SUBMISSIONS (VOTES LOG)
  // -------------------------------------------------------------
  const submissionColumns: Column<Nomination>[] = useMemo(() => {
    return [
      {
        header: headings.nominatorName,
        accessor: (item) => {
          const name = getNominatorName(item);
          const email = getNominatorEmail(item);
          const company = getNominatorCompany(item);
          const city = getNominatorCity(item);

          return (
            <div className="flex items-center gap-3.5 min-w-[220px]">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shadow-sm border border-brand-100 dark:border-brand-500/20">
                {getInitials(name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{name}</p>
                {email && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail size={12} className="text-gray-400 shrink-0" />
                    {email}
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                  <Building2 size={12} className="text-gray-400 shrink-0" />
                  {company} {city !== '-' && `• ${city}`}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: `${headings.nomineeCompany} / ${headings.nomineeContact}`,
        accessor: (item) => {
          const nominees = item.nominees || [];
          if (nominees.length === 0) {
            return <span className="text-xs text-gray-400">No nominees</span>;
          }

          const first = nominees[0];
          if (!first) {
            return <span className="text-xs text-gray-400">No nominees</span>;
          }
          const primaryName = first.companyName || first.contactName || 'Nominee';
          const contactName = first.contactName;
          const otherCount = nominees.length - 1;

          return (
            <div className="min-w-[200px] max-w-[280px]">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-brand-500 shrink-0" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {primaryName}
                </p>
              </div>

              {contactName && contactName !== primaryName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 pl-5">
                  Contact: {contactName}
                </p>
              )}

              {otherCount > 0 && (
                <div className="mt-1 pl-5">
                  <Badge color="light" className="text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    +{otherCount} more {headings.nomineeCompany.toLowerCase()}
                  </Badge>
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: headings.category,
        accessor: (item) => {
          const nominees = item.nominees || [];
          const catNames = Array.from(
            new Set(nominees.map((n) => getNomineeCategoryName(n)).filter(Boolean)),
          );

          return (
            <div className="flex flex-wrap gap-1.5 max-w-[220px]">
              {catNames.length > 0 ? (
                catNames.map((name, idx) => (
                  <Badge
                    key={`${name}-${idx}`}
                    color="info"
                    variant="light"
                    startIcon={<Award size={11} />}
                    className="font-medium text-xs rounded-lg px-2 py-0.5"
                  >
                    {name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400">None</span>
              )}
            </div>
          );
        },
      },
      {
        header: headings.subCategory,
        accessor: (item) => {
          const nominees = item.nominees || [];
          const subNames = Array.from(
            new Set(nominees.map((n) => getNomineeSubCategoryName(n)).filter(Boolean)),
          );

          return (
            <div className="flex flex-wrap gap-1.5 max-w-[220px]">
              {subNames.length > 0 ? (
                subNames.map((name, idx) => (
                  <Badge
                    key={`${name}-${idx}`}
                    color="light"
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900"
                  >
                    {name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>
          );
        },
      },
      {
        header: headings.status,
        accessor: (item) => {
          return (
            <div className="flex items-center gap-2">
              {getStatusBadge(item.status)}
              <select
                value={item.status}
                onChange={(e) => {
                  const newSt = e.target.value as NominationStatus;
                  updateStatusMutation.mutate({
                    id: item.id || (item as { _id?: string })._id || '',
                    newStatus: newSt,
                  });
                }}
                disabled={updateStatusMutation.isPending}
                className="opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity bg-transparent text-xs text-gray-400 border border-gray-200 rounded px-1 py-0.5 cursor-pointer"
                title="Change status"
              >
                <option value={NominationStatus.PENDING}>Pending</option>
                <option value={NominationStatus.REVIEWED}>Reviewed</option>
                <option value={NominationStatus.APPROVED}>Approved</option>
                <option value={NominationStatus.REJECTED}>Rejected</option>
              </select>
            </div>
          );
        },
      },
      {
        header: headings.date,
        accessor: (item) => {
          const dateStr = item.submittedAt || item.createdAt || item.updatedAt;
          return (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <Calendar size={13} className="text-gray-400 shrink-0" />
              <span>
                {dateStr
                  ? new Date(dateStr).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
          );
        },
      },
      {
        header: 'Actions',
        accessor: (item) => {
          return (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedSubmission(item);
                  setIsDetailModalOpen(true);
                }}
                className="p-2 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-xl transition-all"
                title="View Full Submission Breakdown"
              >
                <Eye size={16} />
              </button>
            </div>
          );
        },
      },
    ];
  }, [headings, updateStatusMutation, categoryMap, subCategoryMap]);

  // -------------------------------------------------------------
  // Columns Definition: VIEW 2 - NOMINEE TALLIES / LEADERBOARD
  // -------------------------------------------------------------
  const nomineeColumns: Column<GroupedNominee>[] = useMemo(() => {
    return [
      {
        header: `${headings.nomineeCompany} / ${headings.nomineeContact}`,
        accessor: (grouped) => {
          const nom = grouped.nominee;
          const routeId = nom.id || nom._id || grouped._id;

          return (
            <div
              onClick={() => router.push(`/nominees/${routeId}`)}
              className="flex items-center gap-3.5 cursor-pointer group min-w-[220px]"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-105 transition-transform">
                {getInitials(nom.name || nom.organization)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">
                  {nom.organization || nom.name}
                </p>
                {nom.name && nom.name !== nom.organization && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {headings.nomineeContact}: {nom.name}
                  </p>
                )}
                {nom.email && (
                  <span className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail size={12} />
                    {nom.email}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        header: headings.category,
        accessor: (grouped) => {
          const cats = (grouped.categories || []).map((id) => {
            const cat = categoryMap.get(id);
            return cat?.name || id;
          });

          return (
            <div className="flex flex-wrap gap-1.5 max-w-[240px]">
              {cats.length > 0 ? (
                cats.map((c, i) => (
                  <Badge
                    key={`${c}-${i}`}
                    color="info"
                    variant="light"
                    className="font-medium text-xs rounded-lg px-2 py-0.5"
                  >
                    {c}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400">None</span>
              )}
            </div>
          );
        },
      },
      {
        header: headings.votesCount,
        accessor: (grouped) => (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-2xl bg-brand-50 text-brand-600 font-extrabold text-sm dark:bg-brand-500/10 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20 shadow-sm">
              {grouped.nominatorsCount}
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {headings.votesCount}
            </span>
          </div>
        ),
      },
      {
        header: headings.date,
        accessor: (grouped) => (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={13} className="text-gray-400" />
            <span>
              {grouped.submittedAt
                ? new Date(grouped.submittedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-'}
            </span>
          </div>
        ),
      },
      {
        header: 'Actions',
        accessor: (grouped) => {
          const routeId = grouped.nominee?.id || grouped.nominee?._id || grouped._id;
          return (
            <button
              type="button"
              onClick={() => router.push(`/nominees/${routeId}`)}
              className="p-2 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-xl transition-all"
              title="View Nominee"
            >
              <Eye size={16} />
            </button>
          );
        },
      },
    ];
  }, [headings, router, categoryMap]);

  // -------------------------------------------------------------
  // Columns Definition: VIEW 3 - NOMINATOR DIRECTORY
  // -------------------------------------------------------------
  const nominatorColumns: Column<GroupedNominator>[] = useMemo(() => {
    return [
      {
        header: headings.nominatorName,
        accessor: (grouped) => {
          const nom = grouped.nominator;
          const routeId = nom.id || nom._id || grouped._id;

          return (
            <div
              onClick={() => router.push(`/nominators/${routeId}`)}
              className="flex items-center gap-3.5 cursor-pointer group min-w-[220px]"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shadow-sm border border-blue-100 dark:border-blue-500/20 group-hover:scale-105 transition-transform">
                {getInitials(nom.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">
                  {nom.name}
                </p>
                {nom.email && (
                  <span className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail size={12} />
                    {nom.email}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        header: headings.nominatorCompany,
        accessor: (grouped) => {
          const nom = grouped.nominator;
          return (
            <div className="max-w-[220px]">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {nom.organization || '-'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {nom.city || '-'}
              </p>
            </div>
          );
        },
      },
      {
        header: 'Recommendations',
        accessor: (grouped) => (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-sm dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              {grouped.nomineesCount}
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {headings.nomineeCompany.toLowerCase()}
            </span>
          </div>
        ),
      },
      {
        header: headings.date,
        accessor: (grouped) => (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={13} className="text-gray-400" />
            <span>
              {grouped.submittedAt
                ? new Date(grouped.submittedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-'}
            </span>
          </div>
        ),
      },
      {
        header: 'Actions',
        accessor: (grouped) => {
          const routeId = grouped.nominator?.id || grouped.nominator?._id || grouped._id;
          return (
            <button
              type="button"
              onClick={() => router.push(`/nominators/${routeId}`)}
              className="p-2 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-xl transition-all"
              title="View Nominator"
            >
              <Eye size={16} />
            </button>
          );
        },
      },
    ];
  }, [headings, router]);

  const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: NominationStatus.PENDING, label: 'Pending' },
    { value: NominationStatus.REVIEWED, label: 'Reviewed' },
    { value: NominationStatus.APPROVED, label: 'Approved' },
    { value: NominationStatus.REJECTED, label: 'Rejected' },
  ];

  const totalCount =
    viewMode === 'submissions'
      ? nominationsMeta?.total || 0
      : viewMode === 'nominees'
        ? nomineesMeta?.total || 0
        : nominatorsMeta?.total || 0;

  const currentLoading =
    viewMode === 'submissions'
      ? isNominationsLoading
      : viewMode === 'nominees'
        ? isNomineesLoading
        : isNominatorsLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Preset Terminology Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-gray-50 via-brand-50/20 to-gray-50 dark:from-navy-900 dark:via-navy-800/40 dark:to-navy-900 border border-gray-100 dark:border-navy-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {headings.entriesLabel}
            </h3>
            <Badge color="primary" variant="light" className="text-xs font-semibold px-2 py-0.5">
              {headings.presetName}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Platform table headings dynamically configured for{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {website?.name || 'this website'}
            </span>
            .
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-white dark:bg-navy-950 rounded-2xl border border-gray-200 dark:border-navy-800 shadow-sm w-fit">
          <button
            type="button"
            onClick={() => {
              setViewMode('submissions');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'submissions'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Layers size={14} />
            All Submissions Log
            {nominationsMeta?.total !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  viewMode === 'submissions'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {nominationsMeta.total}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('nominees');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'nominees'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Trophy size={14} />
            By {headings.nomineeCompany}
            {nomineesMeta?.total !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  viewMode === 'nominees'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {nomineesMeta.total}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('nominators');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'nominators'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users size={14} />
            By {headings.nominatorName.split(' ')[0]}
            {nominatorsMeta?.total !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  viewMode === 'nominators'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {nominatorsMeta.total}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-gray-50 dark:bg-navy-950 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={`Search by ${headings.nomineeCompany.toLowerCase()}, ${headings.nomineeContact.toLowerCase()}, or ${headings.nominatorName.toLowerCase()}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus((e.target.value as NominationStatus) || '');
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Category Filter (Only active for Submissions view) */}
          {viewMode === 'submissions' && categories.length > 0 && (
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubCategoryId('');
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer max-w-[200px]"
            >
              <option value="">All {headings.category}</option>
              {categories.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Sub-Category Filter */}
          {viewMode === 'submissions' && categoryId && subCategories.length > 0 && (
            <select
              value={subCategoryId}
              onChange={(e) => {
                setSubCategoryId(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer max-w-[200px]"
            >
              <option value="">All {headings.subCategory}</option>
              {subCategories.map((s) => (
                <option key={s.id || s._id} value={s.id || s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Export Data Modal Trigger */}
          <Button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all text-sm font-medium shrink-0"
          >
            <FileSpreadsheet size={16} />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Main Data Table */}
      {viewMode === 'submissions' ? (
        <DataTable
          data={nominations}
          columns={submissionColumns}
          isLoading={currentLoading}
          serverSide
          totalItems={totalCount}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onPageSizeChange={(sz) => {
            setLimit(sz);
            setPage(1);
          }}
        />
      ) : viewMode === 'nominees' ? (
        <DataTable
          data={groupedNominees}
          columns={nomineeColumns}
          isLoading={currentLoading}
          serverSide
          totalItems={totalCount}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onPageSizeChange={(sz) => {
            setLimit(sz);
            setPage(1);
          }}
        />
      ) : (
        <DataTable
          data={groupedNominators}
          columns={nominatorColumns}
          isLoading={currentLoading}
          serverSide
          totalItems={totalCount}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onPageSizeChange={(sz) => {
            setLimit(sz);
            setPage(1);
          }}
        />
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedSubmission(null);
          }}
          title="Nomination Submission Details"
          size="2xl"
        >
          <div className="space-y-6">
            {/* Header / Nominator Profile Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-50 via-brand-50/10 to-gray-50 dark:from-navy-900 dark:via-navy-800/40 dark:to-navy-900 border border-gray-100 dark:border-navy-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                    {getInitials(getNominatorName(selectedSubmission))}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-brand-600 dark:text-brand-400">
                      {headings.nominatorName}
                    </span>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {getNominatorName(selectedSubmission)}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                      <span>{getNominatorCompany(selectedSubmission)}</span>
                      {getNominatorCity(selectedSubmission) !== '-' && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {getNominatorCity(selectedSubmission)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div>{getStatusBadge(selectedSubmission.status)}</div>
                  <span className="text-xs text-gray-400">
                    {selectedSubmission.submittedAt
                      ? new Date(selectedSubmission.submittedAt).toLocaleString()
                      : '-'}
                  </span>
                </div>
              </div>

              {/* Nominator Contact details */}
              <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-navy-700/60 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-300">
                {getNominatorEmail(selectedSubmission) && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Mail size={13} className="text-brand-500" />
                    {getNominatorEmail(selectedSubmission)}
                  </span>
                )}
                {typeof selectedSubmission.nominatorId === 'object' &&
                  selectedSubmission.nominatorId.phoneNumber && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Phone size={13} className="text-brand-500" />
                      {selectedSubmission.nominatorId.phoneNumber}
                    </span>
                  )}
              </div>
            </div>

            {/* Nominated Entries List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {headings.nomineeCompany} &amp; {headings.nomineeContact} Entries (
                  {selectedSubmission.nominees?.length || 0})
                </h4>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {(selectedSubmission.nominees || []).map((nom, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-xs font-bold">
                          #{idx + 1}
                        </span>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {nom.companyName || nom.contactName || 'Nominee'}
                        </p>
                      </div>

                      {nom.contactName && nom.contactName !== nom.companyName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-8">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {headings.nomineeContact}:
                          </span>{' '}
                          {nom.contactName}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 pl-8 pt-0.5">
                        {nom.contactEmail && (
                          <span className="flex items-center gap-1">
                            <Mail size={11} className="text-gray-400" /> {nom.contactEmail}
                          </span>
                        )}
                        {nom.mobileNo && (
                          <span className="flex items-center gap-1">
                            <Phone size={11} className="text-gray-400" /> {nom.mobileNo}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 pl-8 sm:pl-0">
                      <Badge
                        color="info"
                        variant="light"
                        startIcon={<Award size={11} />}
                        className="text-xs font-semibold px-2 py-0.5"
                      >
                        {getNomineeCategoryName(nom)}
                      </Badge>
                      {getNomineeSubCategoryName(nom) && (
                        <Badge
                          color="light"
                          className="text-[10px] font-medium px-2 py-0.5 border border-gray-200 dark:border-navy-700"
                        >
                          {getNomineeSubCategoryName(nom)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Status Action Bar */}
            <div className="pt-4 border-t border-gray-100 dark:border-navy-700 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500">Update status for this entire submission:</div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const id =
                      selectedSubmission.id || (selectedSubmission as { _id?: string })._id || '';
                    updateStatusMutation.mutate({ id, newStatus: NominationStatus.APPROVED });
                    setSelectedSubmission((p) =>
                      p ? { ...p, status: NominationStatus.APPROVED } : null,
                    );
                  }}
                  className="text-xs text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                >
                  <CheckCircle2 size={14} className="mr-1" /> Approve
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const id =
                      selectedSubmission.id || (selectedSubmission as { _id?: string })._id || '';
                    updateStatusMutation.mutate({ id, newStatus: NominationStatus.REVIEWED });
                    setSelectedSubmission((p) =>
                      p ? { ...p, status: NominationStatus.REVIEWED } : null,
                    );
                  }}
                  className="text-xs text-blue-600 hover:bg-blue-50 border-blue-200"
                >
                  <Clock size={14} className="mr-1" /> Mark Reviewed
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const id =
                      selectedSubmission.id || (selectedSubmission as { _id?: string })._id || '';
                    updateStatusMutation.mutate({ id, newStatus: NominationStatus.REJECTED });
                    setSelectedSubmission((p) =>
                      p ? { ...p, status: NominationStatus.REJECTED } : null,
                    );
                  }}
                  className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <XCircle size={14} className="mr-1" /> Reject
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Export Modal with Preloaded Website ID */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        type="nominee"
        initialWebsiteId={websiteId}
        initialSearch={search}
      />
    </div>
  );
};
