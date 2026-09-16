'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  FolderTree,
  Plus,
  Search,
  Globe,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Filter,
  RefreshCw,
  Tag,
  Hash,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/button/Button';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useGlobalModal } from '@/hooks/useGlobalModal';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import {
  useNominationCategories,
  useNominationSubCategories,
} from '@/modules/nominations/hooks/useNominationCategories';
import {
  NominationCategory,
  NominationSubCategory,
  WebsiteRef,
} from '@/modules/nominations/types/nomination.types';

type CategoryTab = 'main' | 'sub';

interface CategoryFormData {
  type: 'main' | 'sub';
  name: string;
  slug: string;
  categoryId: string;
  websiteId: string;
  isActive: boolean;
  sortOrder: number;
}

export default function NominationCategoriesPage() {
  const { confirm } = useGlobalModal();
  const [activeTab, setActiveTab] = useState<CategoryTab>('main');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState('');

  // Pagination States
  const [mainPage, setMainPage] = useState(1);
  const [mainLimit] = useState(10);
  const [subPage, setSubPage] = useState(1);
  const [subLimit] = useState(10);

  // Modal / Drawer States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    type: 'main' | 'sub';
  } | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    type: 'main',
    name: '',
    slug: '',
    categoryId: '',
    websiteId: '',
    isActive: true,
    sortOrder: 0,
  });

  // Query Websites for filter and assignment
  const { websites = [] } = useWebsites({ limit: 100 });

  // Compute query isActive boolean
  const computedIsActive = useMemo(() => {
    if (statusFilter === 'active') return true;
    if (statusFilter === 'inactive') return false;
    return undefined;
  }, [statusFilter]);

  // Main Categories Hook
  const {
    categories: mainCategories,
    meta: mainMeta,
    isLoading: isMainLoading,
    refetch: refetchMain,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating: isCreatingMain,
    isUpdating: isUpdatingMain,
  } = useNominationCategories({
    page: mainPage,
    limit: mainLimit,
    search: searchTerm || undefined,
    websiteId: selectedWebsiteId || undefined,
    isActive: computedIsActive,
  });

  // Main categories for parent dropdown (fetch all active)
  const { categories: allParentCategories } = useNominationCategories({
    limit: 100,
    isActive: true,
  });

  // Sub Categories Hook
  const {
    subCategories,
    meta: subMeta,
    isLoading: isSubLoading,
    refetch: refetchSub,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    isCreating: isCreatingSub,
    isUpdating: isUpdatingSub,
  } = useNominationSubCategories({
    page: subPage,
    limit: subLimit,
    search: searchTerm || undefined,
    websiteId: selectedWebsiteId || undefined,
    categoryId: selectedParentCategoryId || undefined,
    isActive: computedIsActive,
  });

  // Stats Counters
  const { meta: activeMainMeta } = useNominationCategories({ limit: 1, isActive: true });
  const { meta: activeSubMeta } = useNominationSubCategories({ limit: 1, isActive: true });

  const stats = [
    {
      title: 'Total Main Categories',
      value: mainMeta?.total || 0,
      icon: <Layers size={24} strokeWidth={1.5} />,
      bgIllustration: <Layers size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Active Main Categories',
      value: activeMainMeta?.total || 0,
      icon: <CheckCircle2 size={24} strokeWidth={1.5} />,
      bgIllustration: <CheckCircle2 size={100} strokeWidth={1} />,
      iconBgColor: 'bg-success-50 dark:bg-success-500/10',
      iconTextColor: 'text-success-600 dark:text-success-400',
    },
    {
      title: 'Total Subcategories',
      value: subMeta?.total || 0,
      icon: <FolderTree size={24} strokeWidth={1.5} />,
      bgIllustration: <FolderTree size={100} strokeWidth={1} />,
      iconBgColor: 'bg-purple-50 dark:bg-purple-500/10',
      iconTextColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Active Subcategories',
      value: activeSubMeta?.total || 0,
      icon: <Tag size={24} strokeWidth={1.5} />,
      bgIllustration: <Tag size={100} strokeWidth={1} />,
      iconBgColor: 'bg-brand-50 dark:bg-brand-500/10',
      iconTextColor: 'text-brand-600 dark:text-brand-400',
    },
  ];

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const getWebsiteIdFromCategory = (cat?: NominationCategory): string => {
    if (!cat || !cat.websiteId) return '';
    if (typeof cat.websiteId === 'object' && cat.websiteId !== null) {
      return (cat.websiteId as WebsiteRef).id || (cat.websiteId as WebsiteRef)._id || '';
    }
    return (cat.websiteId as string) || '';
  };

  const handleOpenCreateModal = (type: 'main' | 'sub') => {
    setEditingItem(null);
    const defaultParent = allParentCategories[0];
    const initialWebsiteId =
      type === 'sub'
        ? getWebsiteIdFromCategory(defaultParent)
        : selectedWebsiteId && selectedWebsiteId !== 'global'
          ? selectedWebsiteId
          : '';

    setFormData({
      type,
      name: '',
      slug: '',
      categoryId: defaultParent?.id || '',
      websiteId: initialWebsiteId,
      isActive: true,
      sortOrder: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditMain = (category: NominationCategory) => {
    const websiteIdStr = getWebsiteIdFromCategory(category);

    setEditingItem({ id: category.id, type: 'main' });
    setFormData({
      type: 'main',
      name: category.name,
      slug: category.slug,
      categoryId: '',
      websiteId: websiteIdStr,
      isActive: category.isActive,
      sortOrder: category.sortOrder ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditSub = (sub: NominationSubCategory) => {
    const websiteIdStr =
      typeof sub.websiteId === 'object' && sub.websiteId !== null
        ? (sub.websiteId as WebsiteRef).id || (sub.websiteId as WebsiteRef)._id
        : (sub.websiteId as string) || '';

    const categoryIdStr =
      typeof sub.category === 'object' && sub.category !== null
        ? sub.category.id || sub.category._id || sub.categoryId
        : sub.categoryId || '';

    const parentCat = allParentCategories.find(
      (c) => c.id === categoryIdStr || (c as unknown as { _id?: string })._id === categoryIdStr,
    );
    const resolvedWebsiteId = websiteIdStr || getWebsiteIdFromCategory(parentCat);

    setEditingItem({ id: sub.id || sub._id || '', type: 'sub' });
    setFormData({
      type: 'sub',
      name: sub.name,
      slug: sub.slug,
      categoryId: categoryIdStr,
      websiteId: resolvedWebsiteId,
      isActive: sub.isActive,
      sortOrder: sub.sortOrder ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;

    if (formData.type === 'sub' && !formData.categoryId) return;

    try {
      if (formData.type === 'main') {
        if (editingItem && editingItem.type === 'main') {
          await updateCategory({
            id: editingItem.id,
            data: {
              name: formData.name.trim(),
              slug: formData.slug.trim(),
              websiteId: formData.websiteId || undefined,
              isActive: formData.isActive,
              sortOrder: Number(formData.sortOrder) || 0,
            },
          });
        } else {
          await createCategory({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            websiteId: formData.websiteId || undefined,
            isActive: formData.isActive,
            sortOrder: Number(formData.sortOrder) || 0,
          });
        }
      } else {
        const parentCat = allParentCategories.find(
          (c) =>
            c.id === formData.categoryId ||
            (c as unknown as { _id?: string })._id === formData.categoryId,
        );
        const effectiveWebsiteId = formData.websiteId || getWebsiteIdFromCategory(parentCat);

        if (editingItem && editingItem.type === 'sub') {
          await updateSubCategory({
            id: editingItem.id,
            data: {
              name: formData.name.trim(),
              slug: formData.slug.trim(),
              categoryId: formData.categoryId,
              websiteId: effectiveWebsiteId || undefined,
              isActive: formData.isActive,
              sortOrder: Number(formData.sortOrder) || 0,
            },
          });
        } else {
          await createSubCategory({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            categoryId: formData.categoryId,
            websiteId: effectiveWebsiteId || undefined,
            isActive: formData.isActive,
            sortOrder: Number(formData.sortOrder) || 0,
          });
        }
      }
      setIsModalOpen(false);
    } catch {
      // Toast error handled by mutation
    }
  };

  const handleDeleteMain = (category: NominationCategory) => {
    confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete the main category "${category.name}"? Subcategories attached to it may be affected.`,
      confirmText: 'Delete Category',
      type: 'danger',
      onConfirm: async () => {
        await deleteCategory(category.id);
      },
    });
  };

  const handleDeleteSub = (sub: NominationSubCategory) => {
    const id = sub.id || sub._id;
    if (!id) return;
    confirm({
      title: 'Delete Subcategory',
      message: `Are you sure you want to delete the subcategory "${sub.name}"?`,
      confirmText: 'Delete Subcategory',
      type: 'danger',
      onConfirm: async () => {
        await deleteSubCategory(id);
      },
    });
  };

  const handleToggleMainActive = async (category: NominationCategory) => {
    await updateCategory({
      id: category.id,
      data: { isActive: !category.isActive },
    });
  };

  const handleToggleSubActive = async (sub: NominationSubCategory) => {
    const id = sub.id || sub._id;
    if (!id) return;
    await updateSubCategory({
      id,
      data: { isActive: !sub.isActive },
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedWebsiteId('');
    setStatusFilter('all');
    setSelectedParentCategoryId('');
    setMainPage(1);
    setSubPage(1);
  };

  const getWebsiteBadge = (websiteRef?: WebsiteRef | string) => {
    if (!websiteRef) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-navy-800 dark:text-gray-300">
          <Globe size={12} className="text-gray-400" />
          Global (All)
        </span>
      );
    }

    const websiteName =
      typeof websiteRef === 'object'
        ? websiteRef.name || websiteRef.domain
        : websites.find((w) => w.id === websiteRef)?.name || 'Custom Website';

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20">
        <Globe size={12} className="text-brand-500" />
        {websiteName}
      </span>
    );
  };

  const isSaving = isCreatingMain || isUpdatingMain || isCreatingSub || isUpdatingSub;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Layers className="text-brand-600 dark:text-brand-400" size={28} />
            Nomination Categories
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Organize main categories and subcategories for CIO nominations with website-level
            isolation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              refetchMain();
              refetchSub();
            }}
            startIcon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOpenCreateModal('main')}
            startIcon={<FolderPlus size={16} />}
          >
            Add Main Category
          </Button>
          <Button
            variant="primary"
            onClick={() => handleOpenCreateModal('sub')}
            startIcon={<Plus size={16} />}
            className="shadow-md shadow-brand-500/20"
          >
            Add Subcategory
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <SummaryCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgIllustration={stat.bgIllustration}
            iconBgColor={stat.iconBgColor}
            iconTextColor={stat.iconTextColor}
            isActive={false}
          />
        ))}
      </div>

      {/* Main Content Card with Filters and Tabs */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-6 border-b border-gray-100 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950/40 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-brand-500" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">Filters</span>
            </div>
            {(searchTerm ||
              selectedWebsiteId ||
              statusFilter !== 'all' ||
              selectedParentCategoryId) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <XCircle size={14} />
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by name or slug..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setMainPage(1);
                  setSubPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Website Filter Dropdown */}
            <div>
              <select
                value={selectedWebsiteId}
                onChange={(e) => {
                  setSelectedWebsiteId(e.target.value);
                  setMainPage(1);
                  setSubPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
              >
                <option value="">All Websites & Global</option>
                <option value="global">Global Only (No Website)</option>
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.domain})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                  setMainPage(1);
                  setSubPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Parent Category Filter Dropdown (Active when in subcategory tab or general) */}
            <div>
              <select
                value={selectedParentCategoryId}
                onChange={(e) => {
                  setSelectedParentCategoryId(e.target.value);
                  setSubPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
              >
                <option value="">All Parent Categories</option>
                {allParentCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 dark:border-navy-800 px-6 pt-4 bg-white dark:bg-navy-900">
          <button
            onClick={() => setActiveTab('main')}
            className={`flex items-center gap-2.5 pb-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'main'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Layers size={18} />
            <span>Main Categories</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'main'
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 font-bold'
                  : 'bg-gray-100 text-gray-600 dark:bg-navy-800 dark:text-gray-400'
              }`}
            >
              {mainMeta?.total ?? mainCategories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sub')}
            className={`flex items-center gap-2.5 pb-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'sub'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FolderTree size={18} />
            <span>Sub Categories</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'sub'
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 font-bold'
                  : 'bg-gray-100 text-gray-600 dark:bg-navy-800 dark:text-gray-400'
              }`}
            >
              {subMeta?.total ?? subCategories.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Main Categories Table */}
        {activeTab === 'main' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50/80 dark:bg-navy-950/60 text-xs uppercase font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-navy-800">
                  <tr>
                    <th className="px-6 py-4">Category Name</th>
                    <th className="px-6 py-4">Slug Identifier</th>
                    <th className="px-6 py-4">Assigned Website</th>
                    <th className="px-6 py-4 text-center">Sort Order</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800 font-medium">
                  {isMainLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-brand-500" />
                        Loading main categories...
                      </td>
                    </tr>
                  ) : mainCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        <Layers size={32} className="mx-auto mb-2 opacity-40" />
                        No main categories found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    mainCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-navy-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <Layers size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {category.name}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">
                                ID: {category.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300">
                            {category.slug}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getWebsiteBadge(category.websiteId || category.website)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300">
                            <Hash size={11} className="text-gray-400" />
                            {category.sortOrder ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleMainActive(category)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              category.isActive
                                ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400 border border-success-200 dark:border-success-500/20'
                                : 'bg-gray-100 text-gray-500 dark:bg-navy-800 dark:text-gray-400'
                            }`}
                          >
                            {category.isActive ? (
                              <>
                                <CheckCircle2 size={12} />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={12} />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditMain(category)}
                              className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all"
                              title="Edit Category"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteMain(category)}
                              className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg transition-all"
                              title="Delete Category"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Main Categories Pagination */}
            {mainMeta && mainMeta.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between text-xs text-gray-500">
                <div>
                  Showing Page <strong>{mainMeta.page}</strong> of{' '}
                  <strong>{mainMeta.totalPages}</strong> ({mainMeta.total} total items)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={mainPage <= 1}
                    onClick={() => setMainPage((prev) => Math.max(1, prev - 1))}
                    startIcon={<ChevronLeft size={14} />}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={mainPage >= mainMeta.totalPages}
                    onClick={() => setMainPage((prev) => prev + 1)}
                    endIcon={<ChevronRight size={14} />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sub Categories Table */}
        {activeTab === 'sub' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50/80 dark:bg-navy-950/60 text-xs uppercase font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-navy-800">
                  <tr>
                    <th className="px-6 py-4">Subcategory Name</th>
                    <th className="px-6 py-4">Parent Category</th>
                    <th className="px-6 py-4">Slug Identifier</th>
                    <th className="px-6 py-4">Assigned Website</th>
                    <th className="px-6 py-4 text-center">Sort Order</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800 font-medium">
                  {isSubLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-brand-500" />
                        Loading subcategories...
                      </td>
                    </tr>
                  ) : subCategories.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        <FolderTree size={32} className="mx-auto mb-2 opacity-40" />
                        No subcategories found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    subCategories.map((sub) => {
                      const parentName =
                        typeof sub.category === 'object' && sub.category !== null
                          ? sub.category.name
                          : sub.parentCategoryName ||
                            allParentCategories.find((c) => c.id === sub.categoryId)?.name ||
                            'Unknown Parent';

                      return (
                        <tr
                          key={sub.id || sub._id}
                          className="hover:bg-gray-50/60 dark:hover:bg-navy-800/40 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                <FolderTree size={18} />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {sub.name}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">
                                  ID: {sub.id || sub._id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                              <Layers size={12} className="text-blue-500" />
                              {parentName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300">
                              {sub.slug}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getWebsiteBadge(sub.websiteId || sub.website)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300">
                              <Hash size={11} className="text-gray-400" />
                              {sub.sortOrder ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleSubActive(sub)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                sub.isActive
                                  ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400 border border-success-200 dark:border-success-500/20'
                                  : 'bg-gray-100 text-gray-500 dark:bg-navy-800 dark:text-gray-400'
                              }`}
                            >
                              {sub.isActive ? (
                                <>
                                  <CheckCircle2 size={12} />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditSub(sub)}
                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all"
                                title="Edit Subcategory"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteSub(sub)}
                                className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg transition-all"
                                title="Delete Subcategory"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Sub Categories Pagination */}
            {subMeta && subMeta.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between text-xs text-gray-500">
                <div>
                  Showing Page <strong>{subMeta.page}</strong> of{' '}
                  <strong>{subMeta.totalPages}</strong> ({subMeta.total} total items)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={subPage <= 1}
                    onClick={() => setSubPage((prev) => Math.max(1, prev - 1))}
                    startIcon={<ChevronLeft size={14} />}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={subPage >= subMeta.totalPages}
                    onClick={() => setSubPage((prev) => prev + 1)}
                    endIcon={<ChevronRight size={14} />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-xl bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-navy-800 bg-gray-50/70 dark:bg-navy-950/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  {formData.type === 'main' ? <Layers size={20} /> : <FolderTree size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingItem
                      ? `Edit ${formData.type === 'main' ? 'Main Category' : 'Subcategory'}`
                      : `Add New ${formData.type === 'main' ? 'Main Category' : 'Subcategory'}`}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Configure category name, slug, website association, and status.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800 rounded-xl transition-all"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
              {!editingItem && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Category Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'main' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        formData.type === 'main'
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 shadow-sm'
                          : 'border-gray-200 dark:border-navy-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800'
                      }`}
                    >
                      <Layers size={16} />
                      Main Category
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultParentId =
                          formData.categoryId || allParentCategories[0]?.id || '';
                        const parentCat = allParentCategories.find(
                          (c) =>
                            c.id === defaultParentId ||
                            (c as unknown as { _id?: string })._id === defaultParentId,
                        );
                        setFormData({
                          ...formData,
                          type: 'sub',
                          categoryId: defaultParentId,
                          websiteId: getWebsiteIdFromCategory(parentCat),
                        });
                      }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        formData.type === 'sub'
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 shadow-sm'
                          : 'border-gray-200 dark:border-navy-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800'
                      }`}
                    >
                      <FolderTree size={16} />
                      Sub Category
                    </button>
                  </div>
                </div>
              )}

              {/* If Sub Category, show Parent Category Selector */}
              {formData.type === 'sub' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Parent Category <span className="text-error-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const newParentId = e.target.value;
                      const parentCat = allParentCategories.find(
                        (c) =>
                          c.id === newParentId ||
                          (c as unknown as { _id?: string })._id === newParentId,
                      );
                      setFormData({
                        ...formData,
                        categoryId: newParentId,
                        websiteId: getWebsiteIdFromCategory(parentCat),
                      });
                    }}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                  >
                    <option value="" disabled>
                      Select a parent category
                    </option>
                    {allParentCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Name <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData({
                        ...formData,
                        name: newName,
                        slug: editingItem ? formData.slug : generateSlug(newName),
                      });
                    }}
                    placeholder="e.g. Enterprise Cloud"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Slug <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. enterprise-cloud"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:ring-2 focus:ring-brand-500 font-mono text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Website Association */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Assigned Website
                </label>
                <select
                  value={formData.websiteId}
                  onChange={(e) => setFormData({ ...formData, websiteId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                >
                  <option value="">Global (Available to all nomination portals)</option>
                  {websites.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.domain})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  {formData.type === 'sub'
                    ? 'Automatically synced from the selected parent category. You can override if needed.'
                    : 'Choose a specific website to restrict this category only to that website&apos;s nomination form, or leave Global.'}
                </p>
              </div>

              {/* Sort Order & Active Switch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-navy-700 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white block">
                        Active Category
                      </span>
                      <span className="text-xs text-gray-400 block">
                        Visible in public forms and dropdowns
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-navy-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  startIcon={<Sparkles size={16} />}
                >
                  {editingItem ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
