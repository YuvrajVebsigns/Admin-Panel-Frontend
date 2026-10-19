import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  options,
  placeholder = 'Select an option',
  onChange,
  className = '',
  defaultValue = '',
  value,
  disabled = false,
  error,
}) => {
  const isControlled = value !== undefined;
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const [internalValue, setInternalValue] = useState<string>(defaultValue);

  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange(newValue);
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-navy-700 dark:text-navy-200"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={cn(
            `h-11 w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-11 text-sm transition-colors focus:ring-3 focus:ring-brand-500/10 dark:bg-navy-900 dark:text-navy-100 ${
              error
                ? 'border-error-500 focus:border-error-500 dark:border-error-500'
                : 'border-navy-200 focus:border-brand-500 dark:border-navy-700 dark:focus:border-brand-400'
            } ${disabled ? 'bg-navy-50 cursor-not-allowed dark:bg-navy-950 opacity-60' : ''} ${
              currentValue ? 'text-gray-800 dark:text-white/90' : 'text-gray-400 dark:text-gray-400'
            }`,
            className,
          )}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
        >
          {/* Placeholder option */}
          <option value="" disabled className="text-gray-700 dark:bg-navy-900 dark:text-gray-400">
            {placeholder}
          </option>
          {/* Map over options */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-gray-700 dark:bg-navy-900 dark:text-gray-400"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
        />
      </div>
      {error && (
        <p
          id={`${selectId}-error`}
          className="text-xs font-medium text-error-600 dark:text-error-300"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
