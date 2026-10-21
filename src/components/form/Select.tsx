import React, { useState } from 'react';

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
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-invalid={!!error}
        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-[#0b1a32] dark:text-white/90 dark:placeholder:text-white/30 ${
          error
            ? 'border-error-500 focus:border-error-500 dark:border-error-500'
            : 'border-gray-300 focus:border-brand-500 dark:border-navy-400 dark:focus:border-brand-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed dark:bg-navy-900 opacity-60' : ''} ${
          currentValue ? 'text-gray-800 dark:text-white/90' : 'text-gray-400 dark:text-gray-400'
        } ${className}`}
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
      {error && <p className="text-xs text-error-500 font-medium mt-1">{error}</p>}
    </div>
  );
};

export default Select;
