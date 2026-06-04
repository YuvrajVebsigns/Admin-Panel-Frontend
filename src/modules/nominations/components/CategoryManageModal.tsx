'use client';

import React, { useState } from 'react';
import { NominationCategory } from '../types/nomination.types';
import { useNominationCategories } from '../hooks/useNominationCategories';
import Button from '@/components/ui/button/Button';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';
import { useGlobalModal } from '@/hooks/useGlobalModal';

interface CategoryManageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManageModal: React.FC<CategoryManageModalProps> = ({ isOpen, onClose }) => {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } =
    useNominationCategories({ limit: 100 });
  const { confirm } = useGlobalModal();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    isActive: true,
    sortOrder: 0,
  });

  if (!isOpen) return null;

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ name: '', slug: '', isActive: true, sortOrder: 0 });
  };

  const handleEdit = (category: NominationCategory) => {
    setEditingId(category.id);
    setIsAdding(false);
    setFormData({
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return;

    try {
      if (isAdding) {
        await createCategory(formData);
        setIsAdding(false);
      } else if (editingId) {
        await updateCategory({ id: editingId, data: formData });
        setEditingId(null);
      }
    } catch (error) {
      // Handled by toast
    }
  };

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete the category "${name}"?`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        await deleteCategory(id);
      },
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-navy-800 bg-gray-50 dark:bg-navy-950 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Manage Categories</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add or update categories available for CIO nominations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!isAdding && !editingId && (
            <div className="mb-4 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddNew}
                startIcon={<Plus size={16} />}
              >
                Add Category
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Loading categories...</div>
            ) : (
              categories.map((category) => (
                <div key={category.id}>
                  {editingId === category.id ? (
                    <div className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-2xl border border-brand-100 dark:border-brand-500/20 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                name: e.target.value,
                                slug: generateSlug(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Slug</label>
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={(e) =>
                                setFormData({ ...formData, isActive: e.target.checked })
                              }
                              className="rounded text-brand-500 focus:ring-brand-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Active
                            </span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">
                            Sort Order
                          </label>
                          <input
                            type="number"
                            value={formData.sortOrder}
                            onChange={(e) =>
                              setFormData({ ...formData, sortOrder: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-navy-700">
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSave}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 shadow-sm hover:border-gray-200 dark:hover:border-navy-700 transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {category.name}
                          </span>
                          {!category.isActive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 dark:bg-navy-800">
                              INACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">{category.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-gray-400 hover:text-brand-500 bg-gray-50 dark:bg-navy-800 rounded-lg"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="p-2 text-gray-400 hover:text-error-500 bg-gray-50 dark:bg-navy-800 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {isAdding && (
              <div className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-2xl border border-brand-100 dark:border-brand-500/20 space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Add New Category
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm"
                      placeholder="e.g. Technology"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, sortOrder: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-navy-700">
                  <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSave}>
                    Add Category
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
