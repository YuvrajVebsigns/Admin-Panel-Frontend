'use client';
import React, { useState, KeyboardEvent, useEffect, forwardRef } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  id?: string;
  placeholder?: string;
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  error?: boolean;
  hint?: string;
  className?: string;
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      id,
      placeholder = 'Add keywords...',
      defaultValue = [],
      onChange,
      error,
      hint,
      className = '',
    },
    ref,
  ) => {
    const [tags, setTags] = useState<string[]>(defaultValue);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
      if (defaultValue.length > 0 && tags.length === 0) {
        setTags(defaultValue);
      }
    }, [defaultValue]);

    const addTag = () => {
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !tags.includes(trimmedValue)) {
        const newTags = [...tags, trimmedValue];
        setTags(newTags);
        setInputValue('');
        if (onChange) {
          onChange(newTags);
        }
      }
    };

    const removeTag = (tagToRemove: string) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(newTags);
      if (onChange) {
        onChange(newTags);
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ',') {
        if (inputValue.trim()) {
          e.preventDefault();
          addTag();
        }
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        const lastTag = tags[tags.length - 1];
        if (lastTag !== undefined) {
          removeTag(lastTag);
        }
      }
    };

    return (
      <div className="space-y-2 w-full">
        <div
          className={`flex flex-wrap items-center gap-2 p-2 rounded-lg border transition-all shadow-theme-xs min-h-[44px] ${
            error
              ? 'border-error-500 bg-transparent ring-3 ring-error-500/10'
              : 'border-gray-300 bg-transparent focus-within:border-brand-500 focus-within:ring-3 focus-within:ring-brand-500/10 dark:border-navy-400 dark:bg-[#0b1a32]'
          } ${className}`}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium rounded-md bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-brand-900 dark:hover:text-brand-200 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          <input
            id={id}
            ref={ref}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 min-w-[120px]"
          />
        </div>
        {hint && (
          <p className={`text-sm ${error ? 'text-error-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {hint}
          </p>
        )}
      </div>
    );
  },
);

TagInput.displayName = 'TagInput';

export default TagInput;
