'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Menu } from '../types/menu.types';

export const SortableMenuItem = ({ menu }: { menu: Menu }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: menu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border transition-all ${
        isDragging
          ? 'border-brand-500 shadow-xl ring-2 ring-brand-500/10'
          : 'border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-800 shadow-sm'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
      >
        <GripVertical size={20} />
      </div>

      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">{menu.name}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{menu.path}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
          {menu.group || 'MAIN'}
        </div>
      </div>
    </div>
  );
};
