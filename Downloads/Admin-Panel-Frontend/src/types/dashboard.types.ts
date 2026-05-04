export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface StatsCardData {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: 'primary' | 'emerald' | 'amber' | 'rose' | 'cyan';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  avatar?: string;
}

export type ColumnDef<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
};
