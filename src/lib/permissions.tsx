import React from 'react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Reactive React hook to check if current user has a specific permission
 * (or is super_admin, admin, or has '*' wildcard permission).
 */
export const useHasPermission = (permission: string): boolean => {
  const permissions = useAuthStore((state) => state.permissions);
  const roleKey = useAuthStore((state) => state.roleKey);

  if (roleKey === 'super_admin' || roleKey === 'admin' || permissions?.includes('*')) {
    return true;
  }

  return Boolean(permissions?.includes(permission));
};

/**
 * Reactive React hook to check if current user has ANY of the specified permissions.
 */
export const useHasAnyPermission = (requiredPermissions: string[]): boolean => {
  const permissions = useAuthStore((state) => state.permissions);
  const roleKey = useAuthStore((state) => state.roleKey);

  if (roleKey === 'super_admin' || roleKey === 'admin' || permissions?.includes('*')) {
    return true;
  }

  return requiredPermissions.some((p) => permissions?.includes(p));
};

/**
 * Imperative check if the current user has a specific permission
 * @param permission The permission string to check (e.g., 'users.view')
 * @returns boolean
 */
export const hasPermission = (permission: string): boolean => {
  const { permissions, roleKey } = useAuthStore.getState();

  // Super Admin / Admin check
  if (roleKey === 'super_admin' || roleKey === 'admin' || permissions?.includes('*')) {
    return true;
  }

  return Boolean(permissions?.includes(permission));
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
  const isAllowed = useHasPermission(permission);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
