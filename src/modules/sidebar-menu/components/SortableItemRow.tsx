'use client';
import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  FolderTree,
  File,
} from 'lucide-react';
import { SidebarMenu } from '@/modules/sidebar-menu/types/sidebar-menu.types';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { SortableChildRow } from './SortableChildRow';

interface SortableItemRowProps {
  item: SidebarMenu;
  groupId: string;
  index: number;
  totalCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  selectedChildId?: string | null;
  onSelectChild: (child: SidebarMenu) => void;
  onMoveChildUp: (childIndex: number) => void;
  onMoveChildDown: (childIndex: number) => void;
}

export const SortableItemRow: React.FC<SortableItemRowProps> = ({
  item,
  groupId,
  index,
  totalCount,
  isExpanded,
  onToggleExpand,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  selectedChildId,
  onSelectChild,
  onMoveChildUp,
  onMoveChildDown,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `item:${item.id}`,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  const isFirst = index === 0;
  const isLast = index === totalCount - 1;
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const childrenList = item.children || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border transition-all ${
        isSelected
          ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 shadow-lg ring-2 ring-brand-500/30'
          : isDragging
            ? 'border-brand-400 bg-brand-50/20 dark:bg-brand-950/10 shadow-2xl'
            : 'border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-850 hover:border-brand-300 dark:hover:border-brand-900/60 shadow-xs'
      }`}
    >
      {/* Root Item Header Card */}
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onSelect();
        }}
        className="flex items-center justify-between gap-3 p-3.5 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            title="Drag to reorder item"
          >
            <GripVertical size={18} />
          </div>

          {/* Expand Toggle (Only if has children) */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-1 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-100/50 dark:hover:bg-brand-950/40 transition-colors shrink-0"
              title={isExpanded ? 'Collapse submenus' : 'Expand submenus'}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div className="w-6 shrink-0" />
          )}

          {/* Menu Icon */}
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-colors ${
              hasChildren
                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                : 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
            }`}
          >
            <DynamicIcon name={item.icon || (hasChildren ? 'Folder' : 'File')} size={17} />
          </div>

          {/* Title & Path */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight truncate">
                {item.name}
              </h4>

              {/* Status & Hierarchy Badges */}
              {hasChildren ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
                  <FolderTree size={11} /> Parent ({childrenList.length} sub-items)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md">
                  <File size={10} /> Single Item
                </span>
              )}

              {isSelected && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-brand-500 text-white px-2 py-0.5 rounded-md shadow-xs">
                  {hasChildren ? 'Parent Selected' : 'Single Selected'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{item.path}</p>
          </div>
        </div>

        {/* Up/Down & Select Actions */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Reorder Buttons */}
          <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-0.5 shadow-xs">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              className={`p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                isFirst ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title={hasChildren ? 'Move Parent Up (▲)' : 'Move Item Up (▲)'}
            >
              <ArrowUp size={15} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              className={`p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                isLast ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title={hasChildren ? 'Move Parent Down (▼)' : 'Move Item Down (▼)'}
            >
              <ArrowDown size={15} />
            </button>
          </div>

          {/* Select Button */}
          <button
            type="button"
            onClick={onSelect}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              isSelected
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700'
            }`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>

      {/* Nested Children List (If Parent and Expanded) */}
      {hasChildren && isExpanded && (
        <div className="px-4 pb-3.5 pt-1 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/40 dark:bg-gray-900/30 rounded-b-2xl">
          <div className="ml-5 pl-3 border-l-2 border-brand-200 dark:border-brand-900/60 space-y-2 mt-2">
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Sub-items under {item.name}:</span>
              <span className="text-[10px] lowercase font-normal">drag or use ▲/▼ to reorder</span>
            </div>

            <SortableContext
              items={childrenList.map((c) => `child:${c.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {childrenList.map((child, childIdx) => (
                  <SortableChildRow
                    key={child.id}
                    child={child}
                    parentId={item.id}
                    parentName={item.name}
                    groupId={groupId}
                    index={childIdx}
                    totalCount={childrenList.length}
                    isSelected={selectedChildId === child.id}
                    onSelect={() => onSelectChild(child)}
                    onMoveUp={() => onMoveChildUp(childIdx)}
                    onMoveDown={() => onMoveChildDown(childIdx)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </div>
      )}
    </div>
  );
};
