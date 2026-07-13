import React, { useState, useEffect, useMemo } from 'react';
import {
  useFetchVariables,
  useCreateVariable,
  useUpdateVariable,
  useDeleteVariable,
} from '../hooks/useVariables';
import {
  VariableCategoryGroup,
  CommunicationVariable,
  CreateVariableDto,
} from '../types/communication.types';
import { RawSchemaInspector } from './RawSchemaInspector';
import Button from '@/components/ui/button/Button';
import {
  UserCheck,
  Award,
  Calendar,
  FileText,
  Mail,
  Heart,
  Globe,
  Cpu,
  HelpCircle,
  Save,
  Plus,
  Search,
  Trash2,
  Copy,
  Database,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_TABS = [
  {
    id: VariableCategoryGroup.REGISTRATION,
    label: 'Registration',
    icon: UserCheck,
    defaultModel: 'Registree',
  },
  {
    id: VariableCategoryGroup.NOMINATION,
    label: 'Nomination',
    icon: Award,
    defaultModel: 'Nomination',
  },
  { id: VariableCategoryGroup.EVENT, label: 'Event', icon: Calendar, defaultModel: 'Event' },
  { id: VariableCategoryGroup.BLOG, label: 'Blog', icon: FileText, defaultModel: 'Blog' },
  { id: VariableCategoryGroup.CONTACT, label: 'Contact', icon: Mail, defaultModel: 'Contact' },
  { id: VariableCategoryGroup.SPONSOR, label: 'Sponsor', icon: Heart, defaultModel: 'Sponsor' },
  { id: VariableCategoryGroup.WEBSITE, label: 'Website', icon: Globe, defaultModel: 'Website' },
  { id: VariableCategoryGroup.SYSTEM, label: 'System', icon: Cpu, defaultModel: 'System' },
  { id: VariableCategoryGroup.OTHER, label: 'Other', icon: HelpCircle, defaultModel: 'Other' },
];

export const VariablesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VariableCategoryGroup>(
    VariableCategoryGroup.REGISTRATION,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Fetch all variables. Pagination-free full list simplifies frontend tab management & batch saving
  const { data: variablesResponse, isLoading, refetch } = useFetchVariables({ limit: 1000 });
  const allVariables = useMemo(() => variablesResponse?.data || [], [variablesResponse]);

  // Mutations
  const { mutateAsync: createVariable } = useCreateVariable();
  const { mutateAsync: updateVariable } = useUpdateVariable();
  const { mutateAsync: deleteVariable } = useDeleteVariable();

  // Local state representing the current list of variables in the active tab (including drafts)
  const [localVariables, setLocalVariables] = useState<Partial<CommunicationVariable>[]>([]);
  // Keep track of which variable ids have been modified
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

  // Synchronize local state with fetched variables whenever activeTab or allVariables changes
  useEffect(() => {
    const tabVariables = allVariables.filter((v) => v.categoryGroup === activeTab);
    setLocalVariables(tabVariables);
    setDirtyIds(new Set());
  }, [activeTab, allVariables]);

  const handleCellChange = (
    id: string,
    field: keyof CommunicationVariable,
    value: string | boolean,
  ) => {
    setLocalVariables((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleAddRow = () => {
    const defaultModel = CATEGORY_TABS.find((t) => t.id === activeTab)?.defaultModel || 'Other';
    const tempId = `temp_${Date.now()}`;
    const newRow: Partial<CommunicationVariable> = {
      id: tempId,
      name: '',
      path: '',
      type: 'String',
      isArray: false,
      modelName: defaultModel,
      categoryGroup: activeTab,
      isSenderVariable: false,
      isActive: true,
      description: '',
      ref: '',
    };
    setLocalVariables((prev) => [...prev, newRow]);
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(tempId);
      return next;
    });
  };

  // Add path from Raw Mongoose Inspector
  const handleAddPathFromSchema = (
    modelName: string,
    path: string,
    type: string,
    ref?: string,
    isArray?: boolean,
  ) => {
    const tempId = `temp_${Date.now()}`;
    // Guess a friendly label from path, e.g. "registrations.eventId.name" -> "Event Name"
    const pathParts = path.split('.');
    const rawLabel = pathParts[pathParts.length - 1] || 'Field';
    const friendlyName = rawLabel
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    const newRow: Partial<CommunicationVariable> = {
      id: tempId,
      name: friendlyName,
      path,
      type: type === 'ObjectID' || type === 'ObjectId' ? 'String' : type,
      isArray: !!isArray,
      modelName,
      categoryGroup: activeTab,
      isSenderVariable: false,
      isActive: true,
      ref: ref || '',
      description: `Discovered from ${modelName} schema path: ${path}`,
    };

    setLocalVariables((prev) => [...prev, newRow]);
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(tempId);
      return next;
    });
    toast.success(`Appended path "${path}" to grid drafts!`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (id.startsWith('temp_')) {
      setLocalVariables((prev) => prev.filter((v) => v.id !== id));
      setDirtyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Local draft row removed');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the variable "${name || 'unnamed'}"?`)) {
      const loader = toast.loading('Deleting variable...');
      try {
        await deleteVariable(id);
        setLocalVariables((prev) => prev.filter((v) => v.id !== id));
        toast.success('Variable deleted successfully');
        refetch();
      } catch (err: unknown) {
        toast.error((err as Error).message || 'Failed to delete variable');
      } finally {
        toast.dismiss(loader);
      }
    }
  };

  // Batch saves all modified and newly created rows inside the active category
  const handleSaveCategory = async () => {
    // 1. Validation
    const invalidRows = localVariables.filter((v) => !v.name?.trim() || !v.path?.trim());
    if (invalidRows.length > 0) {
      toast.error('All rows must have a valid Display Name and Dot-Notation Path.');
      return;
    }

    const modifiedRows = localVariables.filter((v) => v.id && dirtyIds.has(v.id));
    if (modifiedRows.length === 0) {
      toast.success('No unsaved changes in this category.');
      return;
    }

    const loader = toast.loading(`Saving ${modifiedRows.length} variable(s)...`);
    try {
      let createdCount = 0;
      let updatedCount = 0;

      await Promise.all(
        modifiedRows.map(async (row) => {
          if (row.id?.startsWith('temp_')) {
            const dto: CreateVariableDto = {
              name: row.name!.trim(),
              path: row.path!.trim(),
              type: row.type || 'String',
              isArray: !!row.isArray,
              modelName: row.modelName || 'Other',
              categoryGroup: row.categoryGroup || activeTab,
              isSenderVariable: !!row.isSenderVariable,
              isActive: row.isActive !== false,
              description: row.description?.trim() || '',
              ref: row.ref?.trim() || '',
            };
            await createVariable(dto);
            createdCount++;
          } else {
            const dto = {
              name: row.name?.trim(),
              path: row.path?.trim(),
              type: row.type,
              isArray: row.isArray,
              modelName: row.modelName,
              categoryGroup: row.categoryGroup,
              isSenderVariable: row.isSenderVariable,
              isActive: row.isActive,
              description: row.description?.trim(),
              ref: row.ref?.trim(),
            };
            await updateVariable({ id: row.id!, data: dto });
            updatedCount++;
          }
        }),
      );

      toast.success(`Successfully saved: ${createdCount} created, ${updatedCount} updated.`);
      refetch();
    } catch (err: unknown) {
      toast.error(
        (err as Error).message || 'Failed to save some variables. Please check for path conflicts.',
      );
    } finally {
      toast.dismiss(loader);
    }
  };

  const handleCopyTag = (path: string) => {
    const tag = `{{params.${path}}}`;
    navigator.clipboard.writeText(tag).then(() => {
      toast.success(`Copied "${tag}" to clipboard!`);
    });
  };

  // Filter local variables based on text search query
  const filteredLocalVariables = useMemo(() => {
    if (!searchQuery.trim()) return localVariables;
    const q = searchQuery.toLowerCase();
    return localVariables.filter(
      (v) =>
        v.name?.toLowerCase().includes(q) ||
        v.path?.toLowerCase().includes(q) ||
        v.modelName?.toLowerCase().includes(q),
    );
  }, [localVariables, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search and control bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search variables by label, path, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <Button
            variant="outline"
            onClick={() => setIsInspectorOpen(true)}
            startIcon={<Database size={14} />}
            className="border-gray-250 dark:border-navy-800 text-gray-650 hover:bg-gray-50/50 hover:text-brand-500"
          >
            Inspect Database Schemas
          </Button>

          <Button
            variant="outline"
            onClick={handleAddRow}
            startIcon={<Plus size={14} />}
            className="border-gray-250 dark:border-navy-800 text-gray-650 hover:bg-gray-50/50"
          >
            Add Row
          </Button>

          <Button
            variant="primary"
            onClick={handleSaveCategory}
            startIcon={<Save size={14} />}
            className="shadow-md shadow-brand-500/10"
            disabled={dirtyIds.size === 0}
          >
            Save Category
          </Button>
        </div>
      </div>

      {/* Main Tabs and Grid Panel */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm overflow-hidden">
        {/* Categories Tab Bar */}
        <div className="flex items-center border-b border-gray-100 dark:border-navy-800 overflow-x-auto scrollbar-none px-6">
          <div className="flex items-center space-x-1 shrink-0 py-1">
            {CATEGORY_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = allVariables.filter((v) => v.categoryGroup === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-xs font-bold transition-all border-b-2 -mb-px shrink-0 outline-none ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 border-brand-500'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 hover:border-gray-250 dark:hover:text-gray-300 dark:hover:border-navy-700'
                  }`}
                >
                  <TabIcon size={14} />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                        : 'bg-gray-100 dark:bg-navy-950 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Viewport */}
        <div className="p-6 overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <span className="text-xs text-gray-500 font-medium">Fetching variables...</span>
            </div>
          ) : filteredLocalVariables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs text-gray-400 font-medium italic">
                No variables in this category.
              </p>
              <button
                onClick={handleAddRow}
                className="mt-3 text-xs text-brand-500 hover:text-brand-600 hover:underline font-bold flex items-center gap-1.5"
              >
                <Plus size={12} /> Add your first category variable
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-navy-800 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="pb-3 pl-3 w-[22%]">Display Name</th>
                  <th className="pb-3 w-[25%]">Dot-Notation Path</th>
                  <th className="pb-3 w-[12%]">Type</th>
                  <th className="pb-3 w-[15%]">Model Reference</th>
                  <th className="pb-3 text-center w-[10%]">Email Sender?</th>
                  <th className="pb-3 text-center w-[8%]">Status</th>
                  <th className="pb-3 pr-3 text-center w-[8%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-850">
                {filteredLocalVariables.map((variable) => {
                  const isDraft = variable.id?.startsWith('temp_');
                  const isDirty = variable.id && dirtyIds.has(variable.id);

                  return (
                    <tr
                      key={variable.id}
                      className={`text-xs hover:bg-gray-50/30 dark:hover:bg-navy-950/20 transition-all ${
                        isDraft ? 'bg-brand-500/5 dark:bg-brand-500/5' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3 pl-3">
                        <input
                          type="text"
                          value={variable.name || ''}
                          onChange={(e) => handleCellChange(variable.id!, 'name', e.target.value)}
                          placeholder="e.g. Full Name"
                          className="w-full bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
                        />
                      </td>

                      {/* Path */}
                      <td className="py-3">
                        <input
                          type="text"
                          value={variable.path || ''}
                          onChange={(e) => handleCellChange(variable.id!, 'path', e.target.value)}
                          placeholder="e.g. name"
                          className="w-full bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-xl px-3 py-1.5 text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
                        />
                      </td>

                      {/* Type */}
                      <td className="py-3">
                        <select
                          value={variable.type || 'String'}
                          onChange={(e) => handleCellChange(variable.id!, 'type', e.target.value)}
                          className="w-full bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-xl px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                        >
                          <option value="String">String</option>
                          <option value="Number">Number</option>
                          <option value="Boolean">Boolean</option>
                          <option value="Date">Date</option>
                          <option value="Array">Array</option>
                          <option value="Object">Object</option>
                        </select>
                      </td>

                      {/* Model / Reference */}
                      <td className="py-3 pr-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={variable.modelName || ''}
                            onChange={(e) =>
                              handleCellChange(variable.id!, 'modelName', e.target.value)
                            }
                            placeholder="Model, e.g. Registree"
                            title="Mongoose Schema collection owner"
                            className="w-1/2 bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                          />
                          <input
                            type="text"
                            value={variable.ref || ''}
                            onChange={(e) => handleCellChange(variable.id!, 'ref', e.target.value)}
                            placeholder="Ref, e.g. Website"
                            title="Linked Reference schema if relational"
                            className="w-1/2 bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                          />
                        </div>
                      </td>

                      {/* isSenderVariable */}
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!variable.isSenderVariable}
                          onChange={(e) =>
                            handleCellChange(variable.id!, 'isSenderVariable', e.target.checked)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 focus:outline-none cursor-pointer accent-brand-500"
                        />
                      </td>

                      {/* Active Status */}
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleCellChange(variable.id!, 'isActive', !variable.isActive)
                          }
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            variable.isActive ? 'bg-brand-500' : 'bg-gray-200 dark:bg-navy-850'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              variable.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Copy Tag */}
                          {!isDraft && (
                            <button
                              type="button"
                              onClick={() => handleCopyTag(variable.path || '')}
                              title="Copy handlebar tag"
                              className="p-1.5 hover:bg-gray-150 dark:hover:bg-navy-800 text-gray-400 hover:text-brand-500 rounded-lg transition-all cursor-pointer"
                            >
                              <Copy size={13} />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(variable.id!, variable.name || '')}
                            title="Delete variable row"
                            className="p-1.5 hover:bg-error-50 dark:hover:bg-error-500/10 text-gray-400 hover:text-error-500 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>

                          {/* Indicator */}
                          {isDirty && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                              title="Unsaved changes"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Raw Schema Inspector Drawer */}
      <RawSchemaInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onAddPath={handleAddPathFromSchema}
      />
    </div>
  );
};
