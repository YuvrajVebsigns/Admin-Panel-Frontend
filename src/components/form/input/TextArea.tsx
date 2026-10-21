import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string; // Error state
  hint?: string; // Hint text to display
}

const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', disabled = false, error = false, hint = '', ...props }, ref) => {
    const errorMessage = typeof error === 'string' ? error : hint;
    let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${className}`;

    if (disabled) {
      textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-navy-950 dark:text-gray-500 dark:border-navy-800`;
    } else if (error) {
      textareaClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-error-500 focus:ring-3 focus:ring-error-500/10 dark:border-error-500 dark:bg-[#0b1a32] dark:text-white/90 dark:focus:border-error-500`;
    } else {
      textareaClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-navy-400 dark:bg-[#0b1a32] dark:text-white/90 dark:focus:border-brand-500`;
    }

    return (
      <div className="relative">
        <textarea ref={ref} disabled={disabled} className={textareaClasses} {...props} />
        {errorMessage && (
          <p
            className={`mt-2 text-sm ${
              error ? 'text-error-500' : 'text-gray-500 dark:text-gray-400'
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
