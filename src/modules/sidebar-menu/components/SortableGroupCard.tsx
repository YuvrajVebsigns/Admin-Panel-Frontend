'use client';
import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronRight, ArrowUp, ArrowDown, Layers } from 'lucide-react';
import { MenuGroupState } from '@/modules/sidebar-menu/types/tree.types';
import { SidebarMenu } from '@/modules/sidebar-menu/types/sidebar-menu.types';
import { SortableItemRow } from './SortableItemRow';

interface SortableGroupCardProps {
  group: MenuGroupState;
  index: number;
  totalCount: number;
  isGroupExpanded: boolean;
  onToggleGroupExpand: () => void;
  isGroupSelected: boolean;
  onSelectGroup: () => void;
  onMoveGroupUp: () => void;
  onMoveGroupDown: () => void;
  selectedItemId?: string | null;
  selectedChildId?: string | null;
  expandedParents: Record<string, boolean>;
  onToggleParentExpand: (parentId: string) => void;
  onSelectItem: (item: SidebarMenu) => void;
  onMoveItemUp: (itemIndex: number) => void;
  onMoveItemDown: (itemIndex: number) => void;
  onSelectChild: (parent: SidebarMenu, child: SidebarMenu) => void;
  onMoveChildUp: (parentIndex: number, childIndex: number) => void;
  onMoveChildDown: (parentIndex: number, childIndex: number) => void;
}

export const SortableGroupCard: React.FC<SortableGroupCardProps> = ({
  group,
  index,
  totalCount,
  isGroupExpanded,
  onToggleGroupExpand,
  isGroupSelected,
  onSelectGroup,
  onMoveGroupUp,
  onMoveGroupDown,
  selectedItemId,
  selectedChildId,
  expandedParents,
  onToggleParentExpand,
  onSelectItem,
  onMoveItemUp,
  onMoveItemDown,
  onSelectChild,
  onMoveChildUp,
  onMoveChildDown,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 200 : 'auto',
  };

  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-3xl border-2 transition-all shadow-md overflow-hidden ${
        isGroupSelected
          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 ring-4 ring-brand-500/20 shadow-xl'
          : isDragging
            ? 'border-brand-400 bg-brand-50/10 dark:bg-brand-950/10 shadow-2xl'
            : 'border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60'
      }`}
    >
      {/* Group Card Header */}
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onSelectGroup();
        }}
        className="flex items-center justify-between gap-4 p-4.5 bg-white/90 dark:bg-gray-850/90 border-b border-gray-200 dark:border-gray-800 backdrop-blur-xs cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Group Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors shrink-0"
            title="Drag to reorder entire group"
          >
            <GripVertical size={20} />
          </div>

          {/* Group Collapse / Expand Chevron */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleGroupExpand();
            }}
            className="p-1 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            title={isGroupExpanded ? 'Collapse group' : 'Expand group'}
          >
            {isGroupExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          {/* Group Icon & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shrink-0">
              <Layers size={18} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black uppercase tracking-wider text-gray-900 dark:text-white truncate">
                  {group.groupName}
                </h3>

                <span className="text-[11px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full border border-brand-200/50 dark:border-brand-900/40">
                  {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                </span>

                {isGroupSelected && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-brand-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                    Group Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium">Section Group #{index + 1}</p>
            </div>
          </div>
        </div>

        {/* Group Actions: Move Up / Down & Select */}
        <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-0.5 shadow-xs">
            <button
              type="button"
              onClick={onMoveGroupUp}
              disabled={isFirst}
              className={`p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-brand-500 hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                isFirst ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title="Move Entire Group Up (▲)"
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              onClick={onMoveGroupDown}
              disabled={isLast}
              className={`p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-brand-500 hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                isLast ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title="Move Entire Group Down (▼)"
            >
              <ArrowDown size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={onSelectGroup}
            className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${
              isGroupSelected
                ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-brand-300'
            }`}
          >
            {isGroupSelected ? 'Selected' : 'Select Group'}
          </button>
        </div>
      </div>

      {/* Group Items Container */}
      {isGroupExpanded && (
        <div className="p-4 space-y-3">
          {group.items.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-gray-400 text-xs">
              No menu items in this group.
            </div>
          ) : (
            <SortableContext
              items={group.items.map((i) => `item:${i.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {group.items.map((item, itemIdx) => (
                  <SortableItemRow
                    key={item.id}
                    item={item}
                    groupId={group.id}
                    index={itemIdx}
                    totalCount={group.items.length}
                    isExpanded={Boolean(expandedParents[item.id])}
                    onToggleExpand={() => onToggleParentExpand(item.id)}
                    isSelected={selectedItemId === item.id}
                    onSelect={() => onSelectItem(item)}
                    onMoveUp={() => onMoveItemUp(itemIdx)}
                    onMoveDown={() => onMoveItemDown(itemIdx)}
                    selectedChildId={selectedChildId}
                    onSelectChild={(child) => onSelectChild(item, child)}
                    onMoveChildUp={(childIdx) => onMoveChildUp(itemIdx, childIdx)}
                    onMoveChildDown={(childIdx) => onMoveChildDown(itemIdx, childIdx)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
};
