'use client';

import React, { useMemo, useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import {
  GroupedNominee,
  NominationCategory,
  NominationSubCategory,
  NominationStatus,
} from '../types/nomination.types';
import { useGroupedNominees } from '../hooks/useNominations';
import {
  useNominationCategories,
  useNominationSubCategories,
  useNominationSubCategoriesByIds,
  useNominationCategoriesByIds,
} from '../hooks/useNominationCategories';
import { Mail, Briefcase, Award } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

interface NomineeTableProps {}

export const NomineeTable: React.FC<NomineeTableProps> = () => {
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    status?: NominationStatus;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { nominees, meta, isLoading } = useGroupedNominees(params);
  const { categories } = useNominationCategories({ limit: 1000, isActive: true });
  const {
    data: subCategoryData,
    isLoading: isSubCategoriesLoading,
    error: subCategoryError,
  } = useNominationSubCategories({ limit: 1000, isActive: true });

  const categoryMap = useMemo(() => {
    const map = new Map<string, NominationCategory>();
    categories.forEach((cat) => {
      const id = cat.id || cat._id;
      if (id) {
        map.set(id, cat);
      }
    });
    return map;
  }, [categories]);

  const subCategoryMap = useMemo(() => {
    const map = new Map<string, NominationSubCategory>();
    subCategoryData?.data.forEach((subCategory) => {
      const id = subCategory.id || subCategory._id;
      if (id) {
        map.set(id, subCategory);
      }
    });
    return map;
  }, [subCategoryData]);

  const missingSubCategoryIds = useMemo(() => {
    if (!nominees) return [];

    const ids = new Set<string>();
    nominees.forEach((grouped) => {
      grouped.categories.forEach((id) => {
        if (!categoryMap.has(id) && !subCategoryMap.has(id)) {
          ids.add(id);
        }
      });
    });

    return Array.from(ids);
  }, [nominees, categoryMap, subCategoryMap]);

  const { subCategories: missingSubCategories, isLoading: isMissingSubCategoriesLoading } =
    useNominationSubCategoriesByIds(missingSubCategoryIds);

  const missingParentCategoryIds = useMemo(() => {
    const ids = new Set<string>();
    missingSubCategories?.forEach((subCategory) => {
      if (subCategory.categoryId && !categoryMap.has(subCategory.categoryId)) {
        ids.add(subCategory.categoryId);
      }
    });
    return Array.from(ids);
  }, [missingSubCategories, categoryMap]);

  const { categories: missingParentCategories } =
    useNominationCategoriesByIds(missingParentCategoryIds);

  const combinedSubCategoryMap = useMemo(() => {
    const map = new Map<string, NominationSubCategory>();
    subCategoryData?.data.forEach((subCategory) => {
      const id = subCategory.id || subCategory._id;
      if (id) {
        map.set(id, subCategory);
      }
    });

    missingSubCategories?.forEach((subCategory) => {
      const id = subCategory.id || subCategory._id;
      if (id && !map.has(id)) {
        map.set(id, subCategory);
      }
    });

    return map;
  }, [subCategoryData, missingSubCategories]);

  const combinedCategoryMap = useMemo(() => {
    const map = new Map<string, NominationCategory>();
    categories.forEach((cat) => {
      const id = cat.id || cat._id;
      if (id) {
        map.set(id, cat);
      }
    });
    missingParentCategories?.forEach((cat) => {
      const id = cat.id || cat._id;
      if (id && !map.has(id)) {
        map.set(id, cat);
      }
    });
    return map;
  }, [categories, missingParentCategories]);

  const getSubCategoryLabel = (doc: NominationSubCategory) => {
    const parentCategory = combinedCategoryMap.get(doc.categoryId);
    return parentCategory ? `${parentCategory.name} > ${doc.name}` : doc.name;
  };

  const getNomineeCategoryNames = (grouped: GroupedNominee) => {
    const names = new Map<string, string>();

    const addName = (name?: string) => {
      if (!name) return;
      names.set(name, name);
    };

    (grouped.categoryDocs ?? []).forEach((doc) => {
      if (!doc) return;
      if ('categoryId' in doc && doc.categoryId) {
        addName(getSubCategoryLabel(doc as NominationSubCategory));
        return;
      }
      addName(doc.name);
    });

    grouped.categories.forEach((catId) => {
      const category = combinedCategoryMap.get(catId);
      if (category) {
        addName(category.name);
        return;
      }

      const subCategory = combinedSubCategoryMap.get(catId);
      if (subCategory) {
        addName(getSubCategoryLabel(subCategory));
      }
    });

    return Array.from(names.values());
  };

  const getNomineeSubCategoryNames = (grouped: GroupedNominee) => {
    const names = new Map<string, string>();

    const addName = (name?: string) => {
      if (!name) return;
      names.set(name, name);
    };

    (grouped.categoryDocs ?? []).forEach((doc) => {
      if (!doc || !('categoryId' in doc) || !doc.categoryId) return;
      addName(getSubCategoryLabel(doc as NominationSubCategory));
    });

    grouped.categories.forEach((catId) => {
      const category = combinedCategoryMap.get(catId);
      if (category) return;

      const subCategory = combinedSubCategoryMap.get(catId);
      if (subCategory) {
        addName(getSubCategoryLabel(subCategory));
      }
    });

    return Array.from(names.values());
  };

  const localIsLoading = isLoading || isSubCategoriesLoading || isMissingSubCategoriesLoading;

  const getStatusColor = (
    status: NominationStatus,
  ): 'warning' | 'success' | 'primary' | 'error' | 'info' | 'light' | 'dark' => {
    switch (status) {
      case NominationStatus.APPROVED:
        return 'success';
      case NominationStatus.REJECTED:
        return 'error';
      case NominationStatus.REVIEWED:
        return 'primary';
      case NominationStatus.PENDING:
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

  const columns: Column<GroupedNominee>[] = [
    {
      header: 'CIO Nominee',
      accessor: (grouped) => {
        const nominee = grouped.nominee;
        return (
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shadow-sm border border-brand-100 dark:border-brand-500/20">
              {getInitials(nominee.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {nominee.name}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                <Mail size={12} className="text-gray-400" />
                {nominee.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Company',
      accessor: (grouped) => {
        const nominee = grouped.nominee;
        return (
          <div className="flex items-center gap-2 max-w-[200px]">
            <Briefcase size={14} className="text-gray-400 shrink-0" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {nominee.organization || '-'}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Category',
      accessor: (grouped) => {
        const uniqueCategoryNames = getNomineeCategoryNames(grouped).filter((name) => {
          const subCategoryName = getNomineeSubCategoryNames(grouped).find(
            (subName) => subName === name || name.includes(`> ${subName}`),
          );
          return !subCategoryName;
        });

        return (
          <div className="flex flex-wrap gap-2 max-w-[260px]">
            {uniqueCategoryNames.length > 0 ? (
              uniqueCategoryNames.map((name) => (
                <Badge
                  key={name}
                  color="info"
                  variant="light"
                  startIcon={<Award size={12} />}
                  className="font-medium text-xs rounded-lg px-2 py-1"
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
      header: 'Sub Category',
      accessor: (grouped) => {
        const subCategoryNames = getNomineeSubCategoryNames(grouped);

        return (
          <div className="flex flex-wrap gap-2 max-w-[260px]">
            {subCategoryNames.length > 0 ? (
              subCategoryNames.map((name, idx) => (
                <Badge
                  key={`${name}-${idx}`}
                  color="light"
                  className="text-[10px] font-semibold uppercase px-2 py-1 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900"
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
      header: 'Nominators',
      accessor: (grouped) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
            {grouped.nominatorsCount}
          </span>
          <span className="text-xs text-gray-500">Submissions</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (grouped) => (
        <div className="flex flex-wrap items-center gap-1.5 max-w-[150px]">
          {grouped.statuses.map((status, i) => (
            <Badge
              key={i}
              color={getStatusColor(status)}
              className="flex items-center gap-1 font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-lg border-none shadow-sm"
            >
              {status}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: NominationStatus.PENDING, label: 'Pending' },
    { value: NominationStatus.REVIEWED, label: 'Reviewed' },
    { value: NominationStatus.APPROVED, label: 'Approved' },
    { value: NominationStatus.REJECTED, label: 'Rejected' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-navy-950 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search nominees by name, email..."
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
                status: (e.target.value as NominationStatus) || undefined,
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
        </div>
      </div>

      {subCategoryError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load sub categories. Please refresh the page.
        </div>
      )}
      <DataTable
        data={nominees}
        columns={columns}
        isLoading={localIsLoading}
        serverSide={true}
        totalItems={meta?.total}
        page={params.page}
        limit={params.limit}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
        onPageSizeChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
      />
    </div>
  );
};
