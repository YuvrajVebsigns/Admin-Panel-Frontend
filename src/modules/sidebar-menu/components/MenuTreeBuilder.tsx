'use client';
import React, { useState } from 'react';
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
import { SidebarMenu } from '@/modules/sidebar-menu/types/sidebar-menu.types';
import { SortableMenuItem } from './SortableMenuItem';
import Button from '@/components/ui/button/Button';
import { Save, GripVertical } from 'lucide-react';

export const MenuTreeBuilder: React.FC = () => {
  const { menus, reorderSidebarMenus, isProcessing } = useSidebarMenus();
  const [items, setItems] = useState<SidebarMenu[]>(menus);
  const [activeId, setActiveId] = useState<string | null>(null);

  React.useEffect(() => {
    setItems(menus);
  }, [menus]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    const reorderData = items.map((item, index) => ({
      id: item.id,
      parentId: (item.parentId as string | null) ?? null,
      order: index,
      group: item.group ?? null,
    }));
    await reorderSidebarMenus(reorderData);
  };

  const activeItem = items.find((i) => i.id === activeId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-50/50 dark:bg-brand-950/10 p-4 rounded-2xl border border-brand-100 dark:border-brand-900/30">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-brand-900 dark:text-brand-400">
            Reorder SidebarMenus
          </h3>
          <p className="text-xs text-brand-600 dark:text-brand-500 mt-1">
            Drag items to change their display order. Changes won't take effect until you click
            Save.
          </p>
        </div>
        <Button
          onClick={handleSave}
          startIcon={<Save size={18} />}
          disabled={isProcessing}
          className="shrink-0"
        >
          {isProcessing ? 'Saving...' : 'Save Structure'}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((menu) => (
              <SortableMenuItem key={menu.id} menu={menu} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}
        >
          {activeId ? (
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-brand-500 shadow-2xl ring-4 ring-brand-500/10">
              <div className="text-gray-400">
                <GripVertical size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">
                  {activeItem?.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{activeItem?.path}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
