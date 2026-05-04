export const PERMISSIONS = {
  // System Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  // Roles
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',

  // Sidebar Menu
  SIDEBAR_MENU_VIEW: 'sidebar-menu.view',
  SIDEBAR_MENU_CREATE: 'sidebar-menu.create',
  SIDEBAR_MENU_UPDATE: 'sidebar-menu.update',
  SIDEBAR_MENU_DELETE: 'sidebar-menu.delete',
  SIDEBAR_MENU_READ_ALL: 'sidebar-menu.read_all',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',

  // Websites
  WEBSITES_VIEW: 'websites.view',
  WEBSITES_CREATE: 'websites.create',
  WEBSITES_UPDATE: 'websites.update',
  WEBSITES_DELETE: 'websites.delete',

  // Feature Toggle
  FEATURE_TOGGLE_VIEW: 'feature-toggle.view',
  FEATURE_TOGGLE_UPDATE: 'feature-toggle.update',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',

  // Support Tickets
  SUPPORT_TICKET_VIEW: 'support-ticket.view',
  SUPPORT_TICKET_UPDATE: 'support-ticket.update',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_GROUPS = {
  'System Users': [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
  ],
  Roles: [
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.ROLES_DELETE,
  ],
  'Sidebar Menu': [
    PERMISSIONS.SIDEBAR_MENU_VIEW,
    PERMISSIONS.SIDEBAR_MENU_CREATE,
    PERMISSIONS.SIDEBAR_MENU_UPDATE,
    PERMISSIONS.SIDEBAR_MENU_DELETE,
    PERMISSIONS.SIDEBAR_MENU_READ_ALL,
  ],
  Websites: [
    PERMISSIONS.WEBSITES_VIEW,
    PERMISSIONS.WEBSITES_CREATE,
    PERMISSIONS.WEBSITES_UPDATE,
    PERMISSIONS.WEBSITES_DELETE,
  ],
  General: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.FEATURE_TOGGLE_VIEW,
    PERMISSIONS.FEATURE_TOGGLE_UPDATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.SUPPORT_TICKET_VIEW,
    PERMISSIONS.SUPPORT_TICKET_UPDATE,
  ],
};
