import React from 'react';
import { useAuthStore } from '@/store/auth.store';

const normalize = (p: string) => (p || '').replace(/['"]/g, '').trim().toLowerCase();

/**
 * Checks whether user's permissions array matches a target permission,
 * taking into account wildcards (*), hyphens vs underscores, and singular/plural website aliases.
 */
export const checkPermissionMatch = (
  userPermissions: string[] | undefined,
  targetPermission: string,
): boolean => {
  if (!userPermissions || !Array.isArray(userPermissions) || !targetPermission) return false;
  const target = normalize(targetPermission);
  const targetUnder = target.replace(/[-_]/g, '_');

  return userPermissions.some((userPerm) => {
    if (typeof userPerm !== 'string') return false;
    const n = normalize(userPerm);
    if (n === '*' || n === target) return true;
    if (n.replace(/[-_]/g, '_') === targetUnder) return true;
    if (n.startsWith('website.') && 'websites.' + n.slice(8) === target) return true;
    if (n.startsWith('websites.') && 'website.' + n.slice(9) === target) return true;
    if (target.startsWith('website.') && 'websites.' + target.slice(8) === n) return true;
    if (target.startsWith('websites.') && 'website.' + target.slice(9) === n) return true;
    return false;
  });
};

/**
 * Reactive React hook to check if current user has a specific permission
 * (or is super_admin, admin, or has '*' wildcard permission).
 */
export const useHasPermission = (permission: string): boolean => {
  const permissions = useAuthStore((state) => state.permissions);
  const roleKey = useAuthStore((state) => state.roleKey);

  if (roleKey === 'super_admin' || roleKey === 'admin') {
    return true;
  }

  return checkPermissionMatch(permissions, permission);
};

/**
 * Reactive React hook to check if current user has ANY of the specified permissions.
 */
export const useHasAnyPermission = (requiredPermissions: string[]): boolean => {
  const permissions = useAuthStore((state) => state.permissions);
  const roleKey = useAuthStore((state) => state.roleKey);

  if (roleKey === 'super_admin' || roleKey === 'admin') {
    return true;
  }

  return requiredPermissions.some((p) => checkPermissionMatch(permissions, p));
};

/**
 * Imperative check if the current user has a specific permission
 * @param permission The permission string to check (e.g., 'users.view')
 * @returns boolean
 */
export const hasPermission = (permission: string): boolean => {
  const { permissions, roleKey } = useAuthStore.getState();

  // Super Admin / Admin check
  if (roleKey === 'super_admin' || roleKey === 'admin') {
    return true;
  }

  return checkPermissionMatch(permissions, permission);
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
