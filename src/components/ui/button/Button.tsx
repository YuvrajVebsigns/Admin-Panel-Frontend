import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode; // Button text or content
  size?: 'sm' | 'md'; // Button size
  variant?: 'primary' | 'outline' | 'ghost' | 'error'; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Click handler
  disabled?: boolean; // Disabled state
  isLoading?: boolean; // Loading state
  className?: string; // Additional classes
  type?: 'button' | 'submit' | 'reset'; // Button type
  title?: string; // Title attribute
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  startIcon,
  endIcon,
  onClick,
  className = '',
  disabled = false,
  isLoading = false,
  type = 'submit',
  title,
  ...props
}) => {
  // Size Classes
  const sizeClasses = {
    sm: 'min-h-11 px-4 py-2.5 text-sm',
    md: 'min-h-11 px-5 py-3 text-sm',
  };

  // Variant Classes
  const variantClasses = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    outline:
      'border border-navy-200 bg-white text-navy-700 hover:bg-navy-50 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-200 dark:hover:bg-navy-800',
    ghost:
      'bg-transparent text-navy-600 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-800',
    error: 'bg-error-600 text-white hover:bg-error-700',
  };

  return (
    <button
      type={type}
      title={title}
      className={cn(
        'admin-action inline-flex items-center justify-center gap-2 rounded-lg font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors motion-safe:duration-200 dark:focus-visible:ring-offset-navy-900',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && (
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {!isLoading && endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
