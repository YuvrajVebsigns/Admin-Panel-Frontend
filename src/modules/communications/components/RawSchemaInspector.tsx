import React, { useState, useMemo } from 'react';
import { useFetchRawMongooseSchema } from '../hooks/useVariables';
import { Search, Database, Plus, X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

interface RawSchemaInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPath: (
    modelName: string,
    path: string,
    type: string,
    ref?: string,
    isArray?: boolean,
  ) => void;
}

export const RawSchemaInspector: React.FC<RawSchemaInspectorProps> = ({
  isOpen,
  onClose,
  onAddPath,
}) => {
  const { data: schemas, isLoading, error } = useFetchRawMongooseSchema();
  const [search, setSearch] = useState('');
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({
    Registree: true, // Expand Registree by default
  });

  const toggleModel = (modelName: string) => {
    setExpandedModels((prev) => ({
      ...prev,
      [modelName]: !prev[modelName],
    }));
  };

  // Filter schemas based on path search query
  const filteredSchemas = useMemo(() => {
    if (!schemas) return [];
    if (!search.trim()) return schemas;

    const query = search.toLowerCase();
    return schemas
      .map((schema) => {
        const matchingFields = schema.fields.filter(
          (f) =>
            f.path.toLowerCase().includes(query) ||
            (f.ref && f.ref.toLowerCase().includes(query)) ||
            f.type.toLowerCase().includes(query),
        );
        return {
          ...schema,
          fields: matchingFields,
        };
      })
      .filter((schema) => schema.fields.length > 0);
  }, [schemas, search]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 h-full w-[450px] bg-white dark:bg-navy-900 shadow-2xl border-l border-gray-150 dark:border-navy-800 z-50 flex flex-col transition-all duration-300 animate-slide-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-150 dark:border-navy-800 bg-gray-50 dark:bg-navy-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="text-brand-500 w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Database Schema Discovery
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Browse available fields and append them to template variables.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-250 dark:hover:bg-navy-800 rounded-xl text-gray-550 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-150 dark:border-navy-800">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search schemas, fields, paths..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs bg-gray-50/50 dark:bg-navy-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <span className="text-xs text-gray-500 font-medium">
                Scanning mongoose schemas...
              </span>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-xs text-error-500 italic bg-error-50 dark:bg-error-950/20 rounded-2xl border border-error-100 dark:border-error-950/30">
              Error fetching database schemas: {error.message}
            </div>
          ) : filteredSchemas.length === 0 ? (
            <div className="text-center text-xs text-gray-450 italic py-10">
              No matching schemas or fields found.
            </div>
          ) : (
            filteredSchemas.map((schema) => {
              const isExpanded = expandedModels[schema.modelName] ?? false;
              return (
                <div
                  key={schema.modelName}
                  className="border border-gray-100 dark:border-navy-800/80 rounded-2xl overflow-hidden bg-gray-50/20 dark:bg-navy-950/5"
                >
                  {/* Collapsible Section Trigger */}
                  <button
                    onClick={() => toggleModel(schema.modelName)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-navy-950 text-left text-xs font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-navy-850 hover:bg-gray-100 dark:hover:bg-navy-800 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span>{schema.modelName}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono font-normal">
                      {schema.fields.length} fields
                    </span>
                  </button>

                  {/* Section Content */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-100 dark:divide-navy-850 bg-white dark:bg-navy-900/50">
                      {schema.fields.map((field) => (
                        <div
                          key={field.path}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/50 dark:hover:bg-navy-800/30 transition-all group"
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-xs font-mono text-gray-900 dark:text-white truncate">
                              {field.path}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] bg-brand-50 dark:bg-brand-500/10 text-brand-650 dark:text-brand-400 px-1 rounded font-bold uppercase tracking-wide">
                                {field.type}
                              </span>
                              {field.isArray && (
                                <span className="text-[9px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 px-1 rounded font-bold uppercase tracking-wide">
                                  Array
                                </span>
                              )}
                              {field.ref && (
                                <span className="text-[9px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 px-1 rounded font-mono">
                                  Ref: {field.ref}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              onAddPath(
                                schema.modelName,
                                field.path,
                                field.type,
                                field.ref,
                                field.isArray,
                              )
                            }
                            title="Add as template variable"
                            className="p-1.5 bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 rounded-lg text-gray-450 hover:text-brand-500 hover:border-brand-300 dark:hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition-all shadow-sm cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
