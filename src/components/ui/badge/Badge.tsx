import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'light' | 'solid';
type BadgeSize = 'sm' | 'md';
type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

interface BadgeProps {
  variant?: BadgeVariant; // Light or solid variant
  size?: BadgeSize; // Badge size
  color?: BadgeColor; // Badge color
  startIcon?: React.ReactNode; // Icon at the start
  endIcon?: React.ReactNode; // Icon at the end
  children: React.ReactNode; // Badge content
  className?: string; // Additional classes
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'light',
  color = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  children,
  className = '',
}) => {
  const baseStyles =
    'inline-flex max-w-full items-center px-2.5 py-1 justify-center gap-1.5 rounded-md font-semibold leading-4';

  // Define size styles
  const sizeStyles = {
    sm: 'text-theme-xs', // Smaller padding and font size
    md: 'text-sm', // Default padding and font size
  };

  // Define color styles for variants
  const variants = {
    light: {
      primary: 'bg-brand-25 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
      success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300',
      error: 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-300',
      warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-300',
      info: 'bg-navy-50 text-navy-600 dark:bg-navy-700 dark:text-navy-200',
      light: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80',
      dark: 'bg-gray-500 text-white dark:bg-white/5 dark:text-white',
    },
    solid: {
      primary: 'bg-brand-500 text-white dark:text-white',
      success: 'bg-success-700 text-white',
      error: 'bg-error-600 text-white',
      warning: 'bg-warning-700 text-white',
      info: 'bg-navy-600 text-white',
      light: 'bg-navy-200 text-navy-800 dark:bg-navy-700 dark:text-navy-100',
      dark: 'bg-gray-700 text-white dark:text-white',
    },
  };

  // Get styles based on size and color variant
  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={cn(baseStyles, sizeClass, colorStyles, className)}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
