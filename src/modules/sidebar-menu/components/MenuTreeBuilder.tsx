'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSidebarMenus } from '../hooks/useSidebarMenus';
import {
  SidebarMenu,
  SidebarMenuReorderDto,
} from '@/modules/sidebar-menu/types/sidebar-menu.types';
import { MenuGroupState, SelectionType } from '@/modules/sidebar-menu/types/tree.types';
import { SortableGroupCard } from './SortableGroupCard';
import Button from '@/components/ui/button/Button';
import {
  Save,
  RotateCcw,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Layers,
  CornerDownRight,
  Sparkles,
  GripVertical,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

// Helper to convert flat / nested menus into structured MenuGroupState array
function parseTreeIntoGroups(menus: SidebarMenu[]): MenuGroupState[] {
  if (!menus || menus.length === 0) return [];

  const sortedMenus = [...menus].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const groupsMap = new Map<string, MenuGroupState>();

  sortedMenus.forEach((menu) => {
    const rawGroup = menu.group ? menu.group.trim() : 'general';
    const groupKey = rawGroup.toLowerCase();

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        id: `group:${groupKey}`,
        groupName: rawGroup,
        items: [],
      });
    }

    const sortedChildren = menu.children
      ? [...menu.children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];

    groupsMap.get(groupKey)!.items.push({
      ...menu,
      children: sortedChildren,
    });
  });

  return Array.from(groupsMap.values());
}

export const MenuTreeBuilder: React.FC = () => {
  const { menuTree, reorderSidebarMenus, isProcessing, isTreeLoading } = useSidebarMenus();

  const [groups, setGroups] = useState<MenuGroupState[]>([]);
  const [selected, setSelected] = useState<SelectionType>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Initialize or synchronize local state with server menu tree
  useEffect(() => {
    if (menuTree && menuTree.length > 0) {
      const parsed = parseTreeIntoGroups(menuTree);
      setGroups(parsed);

      // Default expand all groups and parents
      const groupExp: Record<string, boolean> = {};
      const parentExp: Record<string, boolean> = {};

      parsed.forEach((g) => {
        groupExp[g.id] = true;
        g.items.forEach((item) => {
          if (item.children && item.children.length > 0) {
            parentExp[item.id] = true;
          }
        });
      });

      setExpandedGroups(groupExp);
      setExpandedParents(parentExp);
      setHasUnsavedChanges(false);
      setSelected(null);
    }
  }, [menuTree]);

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ==========================================
  // MOVE OPERATIONS (Group, Item, Child)
  // ==========================================

  // Move entire group up or down
  const moveGroup = useCallback((groupIndex: number, direction: 'up' | 'down') => {
    setGroups((prev) => {
      const newIndex = direction === 'up' ? groupIndex - 1 : groupIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      return arrayMove(prev, groupIndex, newIndex);
    });
    setHasUnsavedChanges(true);
  }, []);

  // Move root-level item (single or parent) up or down within its group
  const moveRootItem = useCallback(
    (groupIndex: number, itemIndex: number, direction: 'up' | 'down') => {
      setGroups((prev) => {
        const targetGroup = prev[groupIndex];
        if (!targetGroup) return prev;

        const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
        if (newIndex < 0 || newIndex >= targetGroup.items.length) return prev;

        const nextGroups = [...prev];
        const nextItems = arrayMove(targetGroup.items, itemIndex, newIndex);
        nextGroups[groupIndex] = {
          ...targetGroup,
          items: nextItems,
        };
        return nextGroups;
      });
      setHasUnsavedChanges(true);
    },
    [],
  );

  // Move child item up or down within its parent
  const moveChildItem = useCallback(
    (groupIndex: number, parentIndex: number, childIndex: number, direction: 'up' | 'down') => {
      setGroups((prev) => {
        const targetGroup = prev[groupIndex];
        if (!targetGroup) return prev;

        const targetParent = targetGroup.items[parentIndex];
        if (!targetParent || !targetParent.children) return prev;

        const newIndex = direction === 'up' ? childIndex - 1 : childIndex + 1;
        if (newIndex < 0 || newIndex >= targetParent.children.length) return prev;

        const nextGroups = [...prev];
        const nextItems = [...targetGroup.items];
        const nextChildren = arrayMove(targetParent.children, childIndex, newIndex);

        nextItems[parentIndex] = {
          ...targetParent,
          children: nextChildren,
        };

        nextGroups[groupIndex] = {
          ...targetGroup,
          items: nextItems,
        };
        return nextGroups;
      });
      setHasUnsavedChanges(true);
    },
    [],
  );

  // Move whatever entity is currently selected
  const moveSelected = useCallback(
    (direction: 'up' | 'down') => {
      if (!selected) return;

      if (selected.type === 'group') {
        const groupIndex = groups.findIndex((g) => g.id === selected.groupId);
        if (groupIndex !== -1) {
          moveGroup(groupIndex, direction);
        }
      } else if (selected.type === 'item') {
        const groupIndex = groups.findIndex((g) => g.id === selected.groupId);
        const group = groups[groupIndex];
        if (group) {
          const itemIndex = group.items.findIndex((i) => i.id === selected.itemId);
          if (itemIndex !== -1) {
            moveRootItem(groupIndex, itemIndex, direction);
          }
        }
      } else if (selected.type === 'child') {
        const groupIndex = groups.findIndex((g) => g.id === selected.groupId);
        const group = groups[groupIndex];
        if (group) {
          const parentIndex = group.items.findIndex((i) => i.id === selected.parentId);
          const parent = group.items[parentIndex];
          if (parent && parent.children) {
            const childIndex = parent.children.findIndex((c) => c.id === selected.childId);
            if (childIndex !== -1) {
              moveChildItem(groupIndex, parentIndex, childIndex, direction);
            }
          }
        }
      }
    },
    [selected, groups, moveGroup, moveRootItem, moveChildItem],
  );

  // Keyboard Navigation: Alt+ArrowUp / Alt+ArrowDown or ArrowUp / ArrowDown when selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowUp' && (e.altKey || e.ctrlKey)) {
        e.preventDefault();
        moveSelected('up');
      } else if (e.key === 'ArrowDown' && (e.altKey || e.ctrlKey)) {
        e.preventDefault();
        moveSelected('down');
      } else if (e.key === 'Escape') {
        setSelected(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, moveSelected]);

  // ==========================================
  // DRAG AND DROP HANDLERS
  // ==========================================

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // 1. Reordering Groups
    if (activeId.startsWith('group:') && overId.startsWith('group:')) {
      setGroups((prev) => {
        const oldIndex = prev.findIndex((g) => g.id === activeId);
        const newIndex = prev.findIndex((g) => g.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prev, oldIndex, newIndex);
        }
        return prev;
      });
      setHasUnsavedChanges(true);
      return;
    }

    // 2. Reordering Root Items
    if (activeId.startsWith('item:') && overId.startsWith('item:')) {
      const activeItemId = activeId.replace('item:', '');
      const overItemId = overId.replace('item:', '');

      setGroups((prev) => {
        // Find source group and target group
        let sourceGroupIdx = -1;
        let sourceItemIdx = -1;
        let targetGroupIdx = -1;
        let targetItemIdx = -1;

        prev.forEach((g, gIdx) => {
          g.items.forEach((item, iIdx) => {
            if (item.id === activeItemId) {
              sourceGroupIdx = gIdx;
              sourceItemIdx = iIdx;
            }
            if (item.id === overItemId) {
              targetGroupIdx = gIdx;
              targetItemIdx = iIdx;
            }
          });
        });

        if (sourceGroupIdx === -1 || targetGroupIdx === -1) return prev;

        const nextGroups = [...prev];
        const sourceGroup = nextGroups[sourceGroupIdx];
        const targetGroup = nextGroups[targetGroupIdx];
        if (!sourceGroup || !targetGroup) return prev;

        // Same group reorder
        if (sourceGroupIdx === targetGroupIdx) {
          nextGroups[sourceGroupIdx] = {
            id: sourceGroup.id,
            groupName: sourceGroup.groupName,
            items: arrayMove(sourceGroup.items, sourceItemIdx, targetItemIdx),
          };
        } else {
          // Move from source group to target group
          const movedItem = sourceGroup.items[sourceItemIdx];
          if (!movedItem) return prev;

          const updatedSourceItems = [...sourceGroup.items];
          updatedSourceItems.splice(sourceItemIdx, 1);

          const updatedTargetItems = [...targetGroup.items];
          const clonedMovedItem: SidebarMenu = {
            ...movedItem,
            group: targetGroup.groupName.toLowerCase(),
          };
          updatedTargetItems.splice(targetItemIdx, 0, clonedMovedItem);

          nextGroups[sourceGroupIdx] = {
            id: sourceGroup.id,
            groupName: sourceGroup.groupName,
            items: updatedSourceItems,
          };
          nextGroups[targetGroupIdx] = {
            id: targetGroup.id,
            groupName: targetGroup.groupName,
            items: updatedTargetItems,
          };
        }

        return nextGroups;
      });
      setHasUnsavedChanges(true);
      return;
    }

    // 3. Reordering Child Items within a parent
    if (activeId.startsWith('child:') && overId.startsWith('child:')) {
      const activeChildId = activeId.replace('child:', '');
      const overChildId = overId.replace('child:', '');

      setGroups((prev) => {
        let found = false;
        const nextGroups = prev.map((g) => {
          const nextItems = g.items.map((item) => {
            if (item.children && item.children.length > 0) {
              const oldIndex = item.children.findIndex((c) => c.id === activeChildId);
              const newIndex = item.children.findIndex((c) => c.id === overChildId);
              if (oldIndex !== -1 && newIndex !== -1) {
                found = true;
                return {
                  ...item,
                  children: arrayMove(item.children, oldIndex, newIndex),
                };
              }
            }
            return item;
          });
          return { ...g, items: nextItems };
        });

        if (found) {
          setHasUnsavedChanges(true);
          return nextGroups;
        }
        return prev;
      });
    }
  };

  // ==========================================
  // SAVE & RESET
  // ==========================================

  const handleSave = async () => {
    let globalOrder = 0;
    const reorderPayload: SidebarMenuReorderDto[] = [];

    groups.forEach((group) => {
      const groupName = group.groupName.toLowerCase();

      group.items.forEach((item) => {
        reorderPayload.push({
          id: item.id,
          parentId: null,
          order: globalOrder++,
          group: groupName,
        });

        if (item.children && item.children.length > 0) {
          item.children.forEach((child, childIdx) => {
            reorderPayload.push({
              id: child.id,
              parentId: item.id,
              order: childIdx,
              group: groupName,
            });
          });
        }
      });
    });

    await reorderSidebarMenus(reorderPayload);
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    if (menuTree && menuTree.length > 0) {
      setGroups(parseTreeIntoGroups(menuTree));
      setHasUnsavedChanges(false);
      setSelected(null);
    }
  };

  // Expand / Collapse all toggle
  const handleToggleExpandAll = () => {
    const allParentsExpanded = Object.values(expandedParents).every(Boolean);
    const newParentState: Record<string, boolean> = {};
    const newGroupState: Record<string, boolean> = {};

    groups.forEach((g) => {
      newGroupState[g.id] = !allParentsExpanded;
      g.items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          newParentState[item.id] = !allParentsExpanded;
        }
      });
    });

    setExpandedGroups(newGroupState);
    setExpandedParents(newParentState);
  };

  // Active Drag Item Finder for DragOverlay
  const activeDragElement = useMemo(() => {
    if (!activeDragId) return null;

    if (activeDragId.startsWith('group:')) {
      const group = groups.find((g) => g.id === activeDragId);
      if (!group) return null;
      return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-brand-500 shadow-2xl flex items-center gap-3 ring-4 ring-brand-500/10">
          <Layers className="text-brand-500" size={20} />
          <span className="font-black text-sm uppercase text-gray-900 dark:text-white">
            {group.groupName}
          </span>
          <span className="text-xs text-gray-400">({group.items.length} items)</span>
        </div>
      );
    }

    if (activeDragId.startsWith('item:')) {
      const itemId = activeDragId.replace('item:', '');
      let foundItem: SidebarMenu | null = null;
      for (const g of groups) {
        const item = g.items.find((i) => i.id === itemId);
        if (item) {
          foundItem = item;
          break;
        }
      }
      if (!foundItem) return null;

      return (
        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-brand-500 shadow-2xl flex items-center gap-3 ring-4 ring-brand-500/10">
          <GripVertical className="text-brand-500" size={18} />
          <DynamicIcon name={foundItem.icon || 'File'} size={16} />
          <span className="font-bold text-sm text-gray-900 dark:text-white">{foundItem.name}</span>
          {foundItem.children && foundItem.children.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
              Parent ({foundItem.children.length})
            </span>
          )}
        </div>
      );
    }

    if (activeDragId.startsWith('child:')) {
      const childId = activeDragId.replace('child:', '');
      let foundChild: SidebarMenu | null = null;
      for (const g of groups) {
        for (const item of g.items) {
          if (item.children) {
            const child = item.children.find((c) => c.id === childId);
            if (child) {
              foundChild = child;
              break;
            }
          }
        }
      }
      if (!foundChild) return null;

      return (
        <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg border-2 border-brand-500 shadow-2xl flex items-center gap-2.5 ring-4 ring-brand-500/10">
          <CornerDownRight className="text-gray-400" size={14} />
          <span className="font-semibold text-xs text-gray-900 dark:text-white">
            {foundChild.name}
          </span>
        </div>
      );
    }

    return null;
  }, [activeDragId, groups]);

  if (isTreeLoading && groups.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="inline-block animate-spin w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full" />
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
          Loading sidebar hierarchy...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action & Status Control Center */}
      <div className="sticky top-4 z-40 bg-white/95 dark:bg-gray-900/95 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Header Title & Indicator */}
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                Menu Reordering & Hierarchy
              </h2>
              {hasUnsavedChanges ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Unsaved Changes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Synced
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select any Group, Parent Menu, or Single Item to move it upward or downward, or drag
              using the handles.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleToggleExpandAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronsUpDown size={15} />
              Toggle Expand
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <RotateCcw size={15} />
              Reset Order
            </button>

            <Button
              onClick={handleSave}
              startIcon={<Save size={18} />}
              isLoading={isProcessing}
              disabled={!hasUnsavedChanges || isProcessing}
              className="py-3 px-6 text-sm font-black rounded-xl shadow-lg shadow-brand-500/20 active:scale-95"
            >
              {isProcessing ? 'Saving Hierarchy...' : 'Save Structure'}
            </Button>
          </div>
        </div>

        {/* Selected Entity Reordering Control Strip */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80">
          {selected ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-lg bg-brand-500 text-white shrink-0">
                  <Sparkles size={15} />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-brand-200 dark:bg-brand-900 text-brand-900 dark:text-brand-300 px-2 py-0.5 rounded">
                      {selected.type === 'group'
                        ? 'Selected Group'
                        : selected.type === 'item'
                          ? selected.isParent
                            ? 'Selected Parent Menu'
                            : 'Selected Single Menu'
                          : 'Selected Sub-Item'}
                    </span>
                    <h4 className="text-sm font-extrabold text-brand-950 dark:text-brand-100 truncate">
                      {selected.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-0.5">
                    Click Move Up / Down below or press{' '}
                    <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded border border-brand-300 dark:border-brand-800 font-mono text-[10px]">
                      Alt+▲
                    </kbd>{' '}
                    /{' '}
                    <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded border border-brand-300 dark:border-brand-800 font-mono text-[10px]">
                      Alt+▼
                    </kbd>
                  </p>
                </div>
              </div>

              {/* Move Up/Down Controls for Selected Element */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => moveSelected('up')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-brand-300 dark:border-brand-800 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-950 transition-colors shadow-xs active:scale-95 cursor-pointer"
                >
                  <ArrowUp size={15} className="text-brand-500" />
                  Move Up
                </button>
                <button
                  type="button"
                  onClick={() => moveSelected('down')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-brand-300 dark:border-brand-800 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-950 transition-colors shadow-xs active:scale-95 cursor-pointer"
                >
                  <ArrowDown size={15} className="text-brand-500" />
                  Move Down
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Deselect"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-gray-400 p-2">
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-brand-500" />
                Select any item, parent, or group to quickly move it using toolbar buttons or
                keyboard shortcuts.
              </span>
              <span className="text-[11px] font-mono text-gray-400 hidden md:inline">
                {groups.length} groups / {groups.reduce((acc, g) => acc + g.items.length, 0)} top
                items
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Drag-and-Drop Tree Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={groups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {groups.map((group, groupIdx) => (
              <SortableGroupCard
                key={group.id}
                group={group}
                index={groupIdx}
                totalCount={groups.length}
                isGroupExpanded={Boolean(expandedGroups[group.id])}
                onToggleGroupExpand={() =>
                  setExpandedGroups((prev) => ({
                    ...prev,
                    [group.id]: !prev[group.id],
                  }))
                }
                isGroupSelected={selected?.type === 'group' && selected.groupId === group.id}
                onSelectGroup={() =>
                  setSelected({
                    type: 'group',
                    groupId: group.id,
                    name: group.groupName,
                  })
                }
                onMoveGroupUp={() => moveGroup(groupIdx, 'up')}
                onMoveGroupDown={() => moveGroup(groupIdx, 'down')}
                selectedItemId={
                  selected?.type === 'item' && selected.groupId === group.id
                    ? selected.itemId
                    : null
                }
                selectedChildId={
                  selected?.type === 'child' && selected.groupId === group.id
                    ? selected.childId
                    : null
                }
                expandedParents={expandedParents}
                onToggleParentExpand={(parentId) =>
                  setExpandedParents((prev) => ({
                    ...prev,
                    [parentId]: !prev[parentId],
                  }))
                }
                onSelectItem={(item) =>
                  setSelected({
                    type: 'item',
                    groupId: group.id,
                    itemId: item.id,
                    name: item.name,
                    isParent: Boolean(item.children && item.children.length > 0),
                    childrenCount: item.children?.length || 0,
                  })
                }
                onMoveItemUp={(itemIdx) => moveRootItem(groupIdx, itemIdx, 'up')}
                onMoveItemDown={(itemIdx) => moveRootItem(groupIdx, itemIdx, 'down')}
                onSelectChild={(parent, child) =>
                  setSelected({
                    type: 'child',
                    groupId: group.id,
                    parentId: parent.id,
                    parentName: parent.name,
                    childId: child.id,
                    name: child.name,
                  })
                }
                onMoveChildUp={(parentIdx, childIdx) =>
                  moveChildItem(groupIdx, parentIdx, childIdx, 'up')
                }
                onMoveChildDown={(parentIdx, childIdx) =>
                  moveChildItem(groupIdx, parentIdx, childIdx, 'down')
                }
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.6',
                },
              },
            }),
          }}
        >
          {activeDragElement}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
