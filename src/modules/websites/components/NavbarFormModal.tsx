'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { NavbarItem, NavbarPosition, MenuType } from '../types/cms.types';
import { useNavbar } from '../hooks/useNavbar';
import { useWebsitePages } from '../hooks/useWebsitePages';

const navbarItemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(1, 'Slug or link is required'),
  position: z.nativeEnum(NavbarPosition),
  menuType: z.nativeEnum(MenuType),
  target: z.enum(['_self', '_blank']).default('_self'),
  parentId: z.string().nullable().optional(),
  pageId: z.string().nullable().optional(),
  order: z.number().default(0),
});

type NavbarItemFormData = z.infer<typeof navbarItemSchema>;

interface NavbarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  position: NavbarPosition;
  itemData?: NavbarItem | null;
  siblingItems?: NavbarItem[];
}

export const NavbarFormModal: React.FC<NavbarFormModalProps> = ({
  isOpen,
  onClose,
  siteId,
  position,
  itemData,
  siblingItems = [],
}) => {
  const isEdit = !!itemData;
  const { createItem, updateItem, isCreating, isUpdating } = useNavbar({ siteId });
  const { pages } = useWebsitePages({ siteId, limit: 100 });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NavbarItemFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(navbarItemSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      position,
      menuType: MenuType.INTERNAL_PAGE,
      target: '_self',
      parentId: null,
      pageId: null,
      order: 0,
    },
  });

  const selectedMenuType = watch('menuType');
  const selectedPageId = watch('pageId');

  // Sync inputs on edit or create mode toggle
  useEffect(() => {
    if (itemData) {
      setValue('title', itemData.title);
      setValue('slug', itemData.slug);
      setValue('position', itemData.position);
      setValue('menuType', itemData.menuType);
      setValue('target', itemData.target || '_self');
      setValue('parentId', itemData.parentId || null);
      setValue('pageId', itemData.pageId || null);
      setValue('order', itemData.order || 0);
    } else {
      setValue('title', '');
      setValue('slug', '');
      setValue('position', position);
      setValue('menuType', MenuType.INTERNAL_PAGE);
      setValue('target', '_self');
      setValue('parentId', null);
      setValue('pageId', null);
      setValue('order', siblingItems.length);
    }
  }, [itemData, position, setValue, siblingItems.length, isOpen]);

  // When menu position changes, assign active default position
  useEffect(() => {
    if (!isEdit) {
      setValue('position', position);
    }
  }, [position, isEdit, setValue]);

  // Automatically update Title & Slug when a Page is selected
  useEffect(() => {
    if (selectedMenuType === MenuType.INTERNAL_PAGE && selectedPageId) {
      const pageItem = pages.find((p) => p.id === selectedPageId);
      if (pageItem) {
        setValue('title', pageItem.title);
        setValue(
          'slug',
          `/${pageItem.slug === 'home' || pageItem.isHomepage ? '' : pageItem.slug}`,
        );
      }
    }
  }, [selectedPageId, selectedMenuType, pages, setValue]);

  // Handle link types defaults
  useEffect(() => {
    if (selectedMenuType === MenuType.CATEGORY) {
      setValue('slug', '#');
      setValue('pageId', null);
    } else if (selectedMenuType === MenuType.EXTERNAL_LINK) {
      setValue('pageId', null);
    }
  }, [selectedMenuType, setValue]);

  const onSubmit = async (data: NavbarItemFormData) => {
    const payload = {
      ...data,
      siteId,
      // Map empty options to null
      parentId: data.parentId || null,
      pageId: data.pageId || null,
    };

    try {
      if (isEdit && itemData) {
        await updateItem({ id: itemData.id, data: payload });
      } else {
        await createItem(payload);
      }
      onClose();
    } catch (e) {
      // Mutation handles alerts
    }
  };

  // Filter possible parent nodes to avoid referencing self as parent
  const parentOptions = siblingItems.filter(
    (item) => !item.parentId && (!isEdit || item.id !== itemData?.id),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Menu Item' : 'Add Navigation Menu Item'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        <div className="flex flex-col space-y-2">
          <Label>Link Action Type</Label>
          <select
            {...register('menuType')}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-navy-400 dark:bg-[#0b1a32] dark:text-white"
          >
            <option value={MenuType.INTERNAL_PAGE}>Link to Website Page</option>
            <option value={MenuType.EXTERNAL_LINK}>Custom / External URL</option>
            <option value={MenuType.CATEGORY}>Category / Non-Clickable Text</option>
          </select>
        </div>

        {selectedMenuType === MenuType.INTERNAL_PAGE && (
          <div className="flex flex-col space-y-2">
            <Label>Select Target Page</Label>
            <select
              {...register('pageId')}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-navy-400 dark:bg-[#0b1a32] dark:text-white"
            >
              <option value="">Select a page...</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (/{p.slug})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Input
            label="Display Title"
            placeholder="e.g. Services"
            {...register('title')}
            error={errors.title?.message}
            required
          />
        </div>

        {selectedMenuType !== MenuType.CATEGORY && (
          <div>
            <Input
              label={selectedMenuType === MenuType.INTERNAL_PAGE ? 'Page Route' : 'External URL'}
              placeholder={
                selectedMenuType === MenuType.INTERNAL_PAGE ? '/services' : 'https://example.com'
              }
              {...register('slug')}
              error={errors.slug?.message}
              required
            />
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <Label>Parent Menu Item (Nesting)</Label>
          <select
            {...register('parentId')}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-navy-400 dark:bg-[#0b1a32] dark:text-white"
          >
            <option value="">None (Top-Level Menu Node)</option>
            {parentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <Label>Open link in</Label>
            <select
              {...register('target')}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-navy-400 dark:bg-[#0b1a32] dark:text-white"
            >
              <option value="_self">Same Tab</option>
              <option value="_blank">New Tab</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Menu Position</Label>
            <select
              {...register('position')}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-navy-400 dark:bg-[#0b1a32] dark:text-white"
              disabled={isEdit}
            >
              <option value={NavbarPosition.HEADER}>Header Navbar</option>
              <option value={NavbarPosition.FOOTER}>Footer Navbar</option>
            </select>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800 bg-transparent">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
