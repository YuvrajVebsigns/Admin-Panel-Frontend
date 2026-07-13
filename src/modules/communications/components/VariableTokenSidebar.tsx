'use client';

import React, { useMemo, useState } from 'react';
import { CommunicationVariable, VariableCategoryGroup } from '../types/communication.types';
import { useFetchVariables } from '../hooks/useVariables';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Layers,
  Search,
  UserCheck,
  Award,
  Calendar,
  FileText,
  Mail,
  Heart,
  Globe,
  Cpu,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  [VariableCategoryGroup.REGISTRATION]: {
    label: 'Registration',
    icon: UserCheck,
    color: 'text-emerald-500',
  },
  [VariableCategoryGroup.NOMINATION]: {
    label: 'Nomination',
    icon: Award,
    color: 'text-amber-500',
  },
  [VariableCategoryGroup.EVENT]: {
    label: 'Event',
    icon: Calendar,
    color: 'text-blue-500',
  },
  [VariableCategoryGroup.BLOG]: {
    label: 'Blog',
    icon: FileText,
    color: 'text-violet-500',
  },
  [VariableCategoryGroup.CONTACT]: {
    label: 'Contact',
    icon: Mail,
    color: 'text-pink-500',
  },
  [VariableCategoryGroup.SPONSOR]: {
    label: 'Sponsor',
    icon: Heart,
    color: 'text-rose-500',
  },
  [VariableCategoryGroup.WEBSITE]: {
    label: 'Website',
    icon: Globe,
    color: 'text-cyan-500',
  },
  [VariableCategoryGroup.SYSTEM]: {
    label: 'System',
    icon: Cpu,
    color: 'text-gray-500',
  },
  [VariableCategoryGroup.OTHER]: {
    label: 'Other',
    icon: HelpCircle,
    color: 'text-gray-400',
  },
};

interface VariableTokenSidebarProps {
  onSelectToken: (token: string) => void;
  modelName?: string;
}

export const VariableTokenSidebar: React.FC<VariableTokenSidebarProps> = ({
  onSelectToken,
  modelName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Object.keys(CATEGORY_META)),
  );

  const { data: variablesResponse, isLoading } = useFetchVariables({
    limit: 500,
    isActive: true,
    ...(modelName ? { modelName } : {}),
  });

  const allVariables: CommunicationVariable[] = useMemo(
    () => variablesResponse?.data || [],
    [variablesResponse],
  );

  // Group by categoryGroup
  const grouped = useMemo(() => {
    const map: Record<string, CommunicationVariable[]> = {};
    const query = searchTerm.toLowerCase().trim();

    for (const v of allVariables) {
      if (
        query &&
        !v.name.toLowerCase().includes(query) &&
        !v.path.toLowerCase().includes(query) &&
        !(v.description || '').toLowerCase().includes(query)
      ) {
        continue;
      }
      const group = v.categoryGroup || VariableCategoryGroup.OTHER;
      if (!map[group]) map[group] = [];
      map[group]!.push(v);
    }
    return map;
  }, [allVariables, searchTerm]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const handleCopyToken = (path: string) => {
    const token = `{{ ${path} }}`;
    navigator.clipboard.writeText(token).then(() => {
      toast.success(`Copied: ${token}`);
    });
  };

  const handleInsertToken = (path: string) => {
    const token = `{{ ${path} }}`;
    onSelectToken(token);
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-navy-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-brand-50 dark:bg-brand-500/10 rounded-lg">
            <Layers size={14} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">Token Registry</h3>
        </div>
        <p className="text-[10px] text-gray-450 dark:text-gray-500 mb-3">
          Click a variable card to insert its token into the active input field.
        </p>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search variables..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-150 dark:border-navy-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Accordion Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-brand-500" />
            <span className="text-xs text-gray-400">Loading tokens...</span>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-gray-400 italic">No variables found</p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, variables]) => {
            const meta = CATEGORY_META[group] || CATEGORY_META[VariableCategoryGroup.OTHER];
            const Icon = meta!.icon;
            const isExpanded = expandedGroups.has(group);

            return (
              <div
                key={group}
                className="rounded-2xl border border-gray-100 dark:border-navy-800 overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-navy-950/50 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={13} className="text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight size={13} className="text-gray-400 shrink-0" />
                  )}
                  <Icon size={14} className={`${meta!.color} shrink-0`} />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex-1">
                    {meta!.label}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-navy-400 bg-gray-100 dark:bg-navy-800 px-1.5 py-0.5 rounded-md">
                    {variables.length}
                  </span>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="px-2 pb-2 space-y-1 animate-fade-in">
                    {variables.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleInsertToken(v.path)}
                        className="group w-full text-left p-2.5 rounded-xl bg-gray-50/70 dark:bg-navy-950/30 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 border border-transparent hover:border-brand-200 dark:hover:border-brand-500/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                            {v.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {v.isArray && (
                              <span className="text-[8px] font-bold bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                Array List
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyToken(v.path);
                              }}
                              className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-brand-100 dark:hover:bg-brand-500/15 text-gray-400 hover:text-brand-600 transition-all"
                              title="Copy token syntax"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-450 dark:text-navy-400 font-mono">
                          {'{{ '}
                          {v.path}
                          {' }}'}
                        </p>
                        {v.description && (
                          <p className="text-[9px] text-gray-400 dark:text-navy-500 mt-0.5 leading-relaxed">
                            {v.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
