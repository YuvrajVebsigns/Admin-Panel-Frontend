import React from 'react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Checks if the current user has a specific permission
 * @param permission The permission string to check (e.g., 'users.view')
 * @returns boolean
 */
export const hasPermission = (permission: string): boolean => {
  const { permissions } = useAuthStore.getState();

  // Super Admin check
  if (permissions.includes('*')) {
    return true;
  }

  return permissions.includes(permission);
};

/**
 * React component wrapper for permission-based rendering
 */
export const Can = ({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const isAllowed = hasPermission(permission);

  if (!isAllowed) {
    return fallback;
  }

  return <>{children} </>;
};
