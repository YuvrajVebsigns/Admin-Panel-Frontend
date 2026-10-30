'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown, CornerDownRight } from 'lucide-react';
import { SidebarMenu } from '@/modules/sidebar-menu/types/sidebar-menu.types';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

interface SortableChildRowProps {
  child: SidebarMenu;
  parentId: string;
  parentName: string;
  groupId: string;
  index: number;
  totalCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const SortableChildRow: React.FC<SortableChildRowProps> = ({
  child,
  index,
  totalCount,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `child:${child.id}`,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        // Prevent clicking inside buttons from triggering select
        if ((e.target as HTMLElement).closest('button')) return;
        onSelect();
      }}
      className={`group relative flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 shadow-md ring-2 ring-brand-500/30'
          : isDragging
            ? 'border-brand-400 bg-brand-50/30 dark:bg-brand-950/20 shadow-xl'
            : 'bg-gray-50/70 dark:bg-gray-800/60 border-gray-200/80 dark:border-gray-700/80 hover:bg-white dark:hover:bg-gray-800 hover:border-brand-200 dark:hover:border-brand-900/40'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Child Tree Indication Icon */}
        <div className="text-gray-300 dark:text-gray-600 shrink-0">
          <CornerDownRight size={15} />
        </div>

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors shrink-0"
          title="Drag to reorder child"
        >
          <GripVertical size={16} />
        </div>

        {/* Icon Preview */}
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700 shrink-0">
          <DynamicIcon name={child.icon || 'FileText'} size={14} />
        </div>

        {/* Child Information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {child.name}
            </h5>
            {isSelected && (
              <span className="text-[9px] font-black uppercase tracking-wider bg-brand-500 text-white px-1.5 py-0.5 rounded">
                Selected
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 font-mono truncate">{child.path}</p>
        </div>
      </div>

      {/* Up/Down Action Buttons */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5 shadow-xs">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className={`p-1 rounded text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors ${
              isFirst ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Move Sub-Item Up (▲)"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className={`p-1 rounded text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors ${
              isLast ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Move Sub-Item Down (▼)"
          >
            <ArrowDown size={13} />
          </button>
        </div>

        {/* Select Toggle Button */}
        <button
          type="button"
          onClick={onSelect}
          className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
            isSelected
              ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-300'
          }`}
        >
          {isSelected ? 'Active' : 'Select'}
        </button>
      </div>
    </div>
  );
};
