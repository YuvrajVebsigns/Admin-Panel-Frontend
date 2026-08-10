import { useMemo } from 'react';
import { useNominationCategories } from './useNominationCategories';
import { NominationCategory } from '../types/nomination.types';

const buildCategoryHierarchy = (categories: NominationCategory[]) => {
  const categoryMap = new Map<string, NominationCategory & { children: NominationCategory[] }>();

  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  const roots: (NominationCategory & { children: NominationCategory[] })[] = [];

  categoryMap.forEach((category) => {
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(category);
      } else {
        roots.push(category);
      }
    } else {
      roots.push(category);
    }
  });

  return roots;
};

export const useNominationHierarchy = () => {
  const { categories, isLoading, error } = useNominationCategories({ limit: 100, isActive: true });

  const rootCategories = useMemo(() => buildCategoryHierarchy(categories), [categories]);

  return { categories: rootCategories, isLoading, error };
};
