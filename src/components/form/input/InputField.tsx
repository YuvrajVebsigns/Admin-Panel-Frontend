import React, { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string; // Optional hint text
  endIcon?: React.ReactNode;
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
      ...props
    },
    ref,
  ) => {
    // Determine input styles based on state (disabled, success, error)
    let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 transition-all dark:bg-[#0b1a32] dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

    // Add styles for the different states
    if (disabled || props.readOnly) {
      inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-navy-950 dark:text-gray-500 dark:border-navy-800`;
    } else if (error) {
      inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10  dark:text-error-400 dark:border-error-500`;
    } else if (success) {
      inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300  dark:text-success-400 dark:border-success-500`;
    } else {
      inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-navy-600 dark:bg-[#0b1a32] dark:text-white/90 dark:focus:border-brand-500`;
    }

    if (endIcon) {
      inputClasses += ` pr-10`; // Add padding to right so text doesn't overlap icon
    }

    return (
      <div className="relative w-full">
        <div className="relative w-full">
          <input ref={ref} type={type} disabled={disabled} className={inputClasses} {...props} />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{endIcon}</div>
          )}
        </div>

        {/* Optional Hint Text */}
        {hint && (
          <p
            className={`mt-1.5 text-xs font-medium ${
              error ? 'text-error-500' : success ? 'text-success-500' : 'text-gray-500'
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
