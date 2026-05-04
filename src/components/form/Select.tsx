import React, { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = 'Select an option',
  onChange,
  className = '',
  defaultValue = '',
  value,
  disabled = false,
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
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-navy-400 dark:bg-[#0b1a32] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-500 ${
        disabled ? 'bg-gray-100 cursor-not-allowed dark:bg-navy-900 opacity-60' : ''
      } ${
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
  );
};

export default Select;
