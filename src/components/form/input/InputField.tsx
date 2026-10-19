import React, { forwardRef, InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean | string;
  hint?: string; // Optional hint text
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  label?: string; // Optional label text
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      className = '',
      disabled = false,
      success = false,
      error = false,
      hint,
      endIcon,
      startIcon,
      label,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
    let inputClasses =
      'h-11 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm placeholder:text-navy-400 focus:ring-3 transition-colors dark:bg-navy-900 dark:text-navy-100 dark:placeholder:text-navy-400';

    // Add styles for the different states
    if (disabled) {
      inputClasses +=
        ' border-navy-200 bg-navy-50 text-navy-400 cursor-not-allowed dark:bg-navy-950 dark:text-navy-400 dark:border-navy-800';
    } else if (error) {
      inputClasses +=
        ' text-navy-800 border-error-500 focus:ring-error-500/10 dark:border-error-400';
    } else if (success) {
      inputClasses +=
        ' text-navy-800 border-success-500 focus:ring-success-500/10 dark:border-success-400';
    } else {
      inputClasses +=
        ' text-navy-800 border-navy-200 focus:border-brand-500 focus:ring-brand-500/10 dark:border-navy-700 dark:focus:border-brand-400';
    }

    if (endIcon) {
      inputClasses += ` pr-10`; // Add padding to right so text doesn't overlap icon
    }
    if (startIcon) {
      inputClasses += ` pl-10`; // Add padding to left so text doesn't overlap icon
    }

    const errorMessage = typeof error === 'string' ? error : hint;

    return (
      <div className="relative w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-navy-700 dark:text-navy-200"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          {startIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-400">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(inputClasses, className)}
            aria-invalid={!!error || undefined}
            {...props}
            aria-describedby={
              [props['aria-describedby'], errorMessage ? messageId : undefined]
                .filter(Boolean)
                .join(' ') || undefined
            }
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">{endIcon}</div>
          )}
        </div>

        {/* Optional Hint/Error Text */}
        {errorMessage && (
          <p
            id={messageId}
            className={`mt-1.5 text-xs font-medium ${
              error
                ? 'text-error-600 dark:text-error-300'
                : success
                  ? 'text-success-700 dark:text-success-300'
                  : 'text-navy-500 dark:text-navy-300'
            }`}
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
