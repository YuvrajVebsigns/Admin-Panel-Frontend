export const PERMISSIONS = {
  // System Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_EXPORT: 'users.export',

  // Roles
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_EXPORT: 'roles.export',

  // Sidebar Menu
  SIDEBAR_MENU_VIEW: 'sidebar-menu.view',
  SIDEBAR_MENU_CREATE: 'sidebar-menu.create',
  SIDEBAR_MENU_UPDATE: 'sidebar-menu.update',
  SIDEBAR_MENU_DELETE: 'sidebar-menu.delete',
  SIDEBAR_MENU_READ_ALL: 'sidebar-menu.read_all',
  SIDEBAR_MENU_EXPORT: 'sidebar-menu.export',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',

  // Websites
  WEBSITES_VIEW: 'websites.view',
  WEBSITES_CREATE: 'websites.create',
  WEBSITES_UPDATE: 'websites.update',
  WEBSITES_DELETE: 'websites.delete',
  WEBSITES_EXPORT: 'websites.export',

  // Pages
  PAGES_VIEW: 'pages.view',
  PAGES_CREATE: 'pages.create',
  PAGES_UPDATE: 'pages.update',
  PAGES_DELETE: 'pages.delete',
  PAGES_EXPORT: 'pages.export',

  // Feature Toggle
  FEATURE_TOGGLE_VIEW: 'feature-toggle.view',
  FEATURE_TOGGLE_UPDATE: 'feature-toggle.update',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',

  // Support Tickets
  SUPPORT_TICKET_VIEW: 'support-ticket.view',
  SUPPORT_TICKET_UPDATE: 'support-ticket.update',

  // Blogs
  BLOGS_VIEW: 'blogs.view',
  BLOGS_CREATE: 'blogs.create',
  BLOGS_UPDATE: 'blogs.update',
  BLOGS_DELETE: 'blogs.delete',
  BLOGS_EXPORT: 'blogs.export',

  // Events
  EVENTS_VIEW: 'events.view',
  EVENTS_CREATE: 'events.create',
  EVENTS_UPDATE: 'events.update',
  EVENTS_DELETE: 'events.delete',
  EVENTS_EXPORT: 'events.export',

  // Sponsors
  SPONSORS_VIEW: 'sponsors.view',
  SPONSORS_CREATE: 'sponsors.create',
  SPONSORS_UPDATE: 'sponsors.update',
  SPONSORS_DELETE: 'sponsors.delete',
  SPONSORS_EXPORT: 'sponsors.export',

  // Registrations / CRM Registrees
  REGISTRATIONS_VIEW: 'registrations.view',
  REGISTRATIONS_CREATE: 'registrations.create',
  REGISTRATIONS_UPDATE: 'registrations.update',
  REGISTRATIONS_DELETE: 'registrations.delete',
  REGISTRATIONS_EXPORT: 'registrations.export',

  // Attendance
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_CREATE: 'attendance.create',
  ATTENDANCE_UPDATE: 'attendance.update',
  ATTENDANCE_DELETE: 'attendance.delete',
  ATTENDANCE_EXPORT: 'attendance.export',

  // CXO Network
  CXO_NETWORK_VIEW: 'cxo-network.view',
  CXO_NETWORK_EXPORT: 'cxo-network.export',

  // Nominators
  NOMINATORS_VIEW: 'nominators.view',
  NOMINATORS_CREATE: 'nominators.create',
  NOMINATORS_UPDATE: 'nominators.update',
  NOMINATORS_DELETE: 'nominators.delete',
  NOMINATORS_EXPORT: 'nominators.export',

  // Nominees
  NOMINEES_VIEW: 'nominees.view',
  NOMINEES_CREATE: 'nominees.create',
  NOMINEES_UPDATE: 'nominees.update',
  NOMINEES_DELETE: 'nominees.delete',
  NOMINEES_EXPORT: 'nominees.export',

  // Nomination Categories
  NOMINATION_CATEGORIES_VIEW: 'nomination-categories.view',
  NOMINATION_CATEGORIES_EXPORT: 'nomination-categories.export',

  // Contacts
  CONTACTS_VIEW: 'contacts.view',
  CONTACTS_DELETE: 'contacts.delete',
  CONTACTS_EXPORT: 'contacts.export',

  // Subscribes
  SUBSCRIBES_VIEW: 'subscribes.view',
  SUBSCRIBES_DELETE: 'subscribes.delete',
  SUBSCRIBES_EXPORT: 'subscribes.export',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_CREATE: 'reports.create',
  REPORTS_UPDATE: 'reports.update',
  REPORTS_DELETE: 'reports.delete',
  REPORTS_EXPORT: 'reports.export',

  // Media
  MEDIA_VIEW: 'media.view',
  MEDIA_CREATE: 'media.create',
  MEDIA_DELETE: 'media.delete',
  MEDIA_EXPORT: 'media.export',

  // Communications
  COMMUNICATIONS_VIEW: 'communications.view',
  COMMUNICATIONS_EXPORT: 'communications.export',
};

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
