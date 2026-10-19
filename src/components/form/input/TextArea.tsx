import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string; // Error state
  hint?: string; // Hint text to display
}

const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', disabled = false, error = false, hint = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const errorMessage = typeof error === 'string' ? error : hint;
    let textareaClasses =
      'min-h-28 w-full rounded-lg border bg-white px-3.5 py-3 text-sm leading-6 text-navy-800 placeholder:text-navy-400 transition-colors dark:bg-navy-900 dark:text-navy-100';

    if (disabled) {
      textareaClasses +=
        ' bg-navy-50 opacity-60 border-navy-200 cursor-not-allowed dark:bg-navy-950 dark:border-navy-800';
    } else if (error) {
      textareaClasses +=
        ' border-error-500 focus:border-error-500 focus:ring-3 focus:ring-error-500/10 dark:border-error-400';
    } else {
      textareaClasses +=
        ' border-navy-200 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-navy-700 dark:focus:border-brand-400';
    }

    return (
      <div className="relative">
        <textarea
          ref={ref}
          disabled={disabled}
          className={cn(textareaClasses, className)}
          {...props}
          id={inputId}
          aria-invalid={!!error || props['aria-invalid'] || undefined}
          aria-describedby={
            [props['aria-describedby'], errorMessage ? `${inputId}-message` : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
        {errorMessage && (
          <p
            id={`${inputId}-message`}
            className={`mt-2 text-sm ${
              error ? 'text-error-600 dark:text-error-300' : 'text-navy-500 dark:text-navy-300'
            }`}
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';

export default TextArea;
