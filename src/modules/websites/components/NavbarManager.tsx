'use client';
import React, { useState } from 'react';
import { useNavbar } from '../hooks/useNavbar';
import { NavbarItem, NavbarPosition, MenuType } from '../types/cms.types';
import { NavbarFormModal } from './NavbarFormModal';
import Button from '@/components/ui/button/Button';
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  ExternalLink,
  FolderOpen,
  Link,
  FileCode,
} from 'lucide-react';

interface NavbarManagerProps {
  siteId: string;
}

export const NavbarManager: React.FC<NavbarManagerProps> = ({ siteId }) => {
  const [position, setPosition] = useState<NavbarPosition>(NavbarPosition.HEADER);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NavbarItem | null>(null);

  // Fetch hierarchical items
  const { items, isLoading, updateItem, deleteItem, reorderItems } = useNavbar({
    siteId,
    position,
    nested: true,
  });

  const handleEdit = (item: NavbarItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this navigation item and its children?')) {
      try {
        await deleteItem(id);
      } catch (e) {}
    }
  };

  const handleToggleVisibility = async (item: NavbarItem) => {
    try {
      await updateItem({
        id: item.id,
        data: { isVisible: !item.isVisible },
      });
    } catch (e) {}
  };

  // Reordering sibling nodes within their hierarchical lists
  const handleMove = async (item: NavbarItem, direction: 'up' | 'down') => {
    // 1. Gather all siblings at the same level
    let siblings: NavbarItem[] = [];

    const findSiblings = (nodes: NavbarItem[]): boolean => {
      // Check if item is in the current level list
      if (nodes.some((n) => n.id === item.id)) {
        siblings = [...nodes];
        return true;
      }
      // Recursively search children levels
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          const found = findSiblings(node.children);
          if (found) return true;
        }
      }
      return false;
    };

    findSiblings(items);

    if (siblings.length <= 1) return;

    // 2. Sort siblings by order index to ensure correct visual alignment
    siblings.sort((a, b) => a.order - b.order);

    const index = siblings.findIndex((n) => n.id === item.id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= siblings.length) return;

    // 3. Swap indices
    const temp = siblings[index] as NavbarItem;
    siblings[index] = siblings[newIndex] as NavbarItem;
    siblings[newIndex] = temp;

    // 4. Map updated orders array
    const orders = siblings.map((sibling, idx) => ({
      id: sibling.id,
      order: idx,
    }));

    try {
      await reorderItems({
        siteId,
        position,
        orders,
      });
    } catch (e) {}
  };

  // Recursively render menu nodes in the collapsible parent-child DOM layout
  const renderMenuTree = (nodes: NavbarItem[], depth = 0) => {
    // Sort items by order
    const sortedNodes = [...nodes].sort((a, b) => a.order - b.order);

    return sortedNodes.map((item, index) => {
      const isFirst = index === 0;
      const isLast = index === sortedNodes.length - 1;

      return (
        <React.Fragment key={item.id}>
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-2xl shadow-theme-sm transition-all hover:border-brand-200 dark:hover:border-navy-600 ${
              item.isVisible
                ? 'bg-white dark:bg-navy-800 border-gray-100 dark:border-navy-700'
                : 'bg-gray-55/70 dark:bg-navy-800/40 border-gray-200/60 dark:border-navy-700/60 opacity-70'
            }`}
            style={{ marginLeft: `${depth * 32}px` }}
          >
            <div className="flex items-center gap-3.5">
              {/* Type-specific Icon Indicator */}
              <div className="p-2.5 rounded-xl bg-gray-55 dark:bg-navy-900 text-gray-400">
                {item.menuType === MenuType.INTERNAL_PAGE ? (
                  <FileCode size={18} className="text-brand-500" />
                ) : item.menuType === MenuType.EXTERNAL_LINK ? (
                  <Link size={18} className="text-emerald-500" />
                ) : (
                  <FolderOpen size={18} className="text-amber-500" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4
                    className={`font-bold leading-tight ${
                      item.isVisible ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                    }`}
                  >
                    {item.title}
                  </h4>
                  {item.target === '_blank' && <ExternalLink size={12} className="text-gray-400" />}
                  {!item.isVisible && (
                    <span className="px-1.5 py-0.5 rounded-md bg-gray-200/70 dark:bg-navy-700/70 text-[9px] text-gray-550 dark:text-navy-300 font-bold uppercase tracking-wider">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {item.menuType === MenuType.CATEGORY ? 'Grouping Label' : item.slug}
                </p>
              </div>
            </div>

            {/* Actions: Reorder up/down, Toggle visibility, & Edit/Delete */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <div className="flex items-center border border-gray-100 dark:border-navy-700 rounded-lg overflow-hidden p-0.5 bg-gray-50/50 dark:bg-navy-900/30">
                <button
                  type="button"
                  onClick={() => handleMove(item, 'up')}
                  disabled={isFirst}
                  className={`p-1.5 rounded text-gray-400 border-none bg-transparent hover:text-brand-500 hover:bg-white dark:hover:bg-navy-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <ArrowUp size={14} />
                </button>
                <div className="w-[1px] h-3 bg-gray-200 dark:bg-navy-700" />
                <button
                  type="button"
                  onClick={() => handleMove(item, 'down')}
                  disabled={isLast}
                  className={`p-1.5 rounded text-gray-400 border-none bg-transparent hover:text-brand-500 hover:bg-white dark:hover:bg-navy-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleToggleVisibility(item)}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 border-none outline-none ${
                  item.isVisible ? 'bg-brand-500' : 'bg-gray-200 dark:bg-navy-700'
                }`}
                title={item.isVisible ? 'Hide navigation item' : 'Show navigation item'}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                    item.isVisible ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => handleEdit(item)}
                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-navy-900 rounded-lg transition-colors border-none bg-transparent"
              >
                <Edit size={16} />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors border-none bg-transparent"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Children nodes list */}
          {item.children && item.children.length > 0 && renderMenuTree(item.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  // Flattened items list for parent dropdown selectors
  const flattenItems = (nodes: NavbarItem[]): NavbarItem[] => {
    const list: NavbarItem[] = [];
    const recurse = (arr: NavbarItem[]) => {
      arr.forEach((node) => {
        list.push(node);
        if (node.children && node.children.length > 0) {
          recurse(node.children);
        }
      });
    };
    recurse(nodes);
    return list;
  };

  return (
    <div className="space-y-6">
      {/* Position Toggle and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-navy-900/30 p-4 rounded-2xl border border-gray-100 dark:border-navy-700">
        <div className="flex items-center p-1 bg-gray-100 dark:bg-navy-900 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setPosition(NavbarPosition.HEADER)}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all border-none ${
              position === NavbarPosition.HEADER
                ? 'bg-white text-brand-600 shadow-sm dark:bg-navy-800 dark:text-white'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
            }`}
          >
            Header Menu Links
          </button>
          <button
            type="button"
            onClick={() => setPosition(NavbarPosition.FOOTER)}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all border-none ${
              position === NavbarPosition.FOOTER
                ? 'bg-white text-brand-600 shadow-sm dark:bg-navy-800 dark:text-white'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
            }`}
          >
            Footer Menu Links
          </button>
        </div>

        <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          Add Navigation Item
        </Button>
      </div>

      {/* Hierarchical tree builder list */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm font-semibold text-gray-400">Loading navigation hierarchy...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 border border-dashed border-gray-100 dark:border-navy-700 rounded-3xl bg-white dark:bg-navy-800">
          <p className="text-sm font-bold text-gray-400">No navigation items registered</p>
          <p className="text-xs text-gray-500">
            Create menus to build the responsive frontend navigation structure.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 max-w-4xl">{renderMenuTree(items)}</div>
      )}

      {/* Navbar Form Modal */}
      <NavbarFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        siteId={siteId}
        position={position}
        itemData={selectedItem}
        siblingItems={flattenItems(items)}
      />
    </div>
  );
};
