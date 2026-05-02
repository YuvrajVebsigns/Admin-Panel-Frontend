'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { Search, ChevronDown, X, LucideIcon } from 'lucide-react';

type IconPickerProps = {
  value?: string;
  onChange: (iconName: string) => void;
};

const iconNames = Object.keys(Icons).filter((name) => name !== 'createLucideIcon');

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(30);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter icons based on search term
  const filteredIcons = useMemo(() => {
    return iconNames.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  // Reset scroll and visible count when search changes
  useEffect(() => {
    setVisibleCount(30);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [searchTerm]);

  // Handle lazy loading on scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight + 50) {
        setVisibleCount((prev) => Math.min(prev + 30, filteredIcons.length));
      }
    },
    [filteredIcons.length],
  );

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedIconName = value || '';
  const SelectedIcon = (Icons as unknown as Record<string, LucideIcon>)[selectedIconName];

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input Field Toggle - Changed to Button for Tab Navigation */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm cursor-pointer hover:border-brand-300 transition-all shadow-theme-xs text-left focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <div className="flex items-center justify-center w-5 h-5 text-gray-500 dark:text-gray-400">
          {SelectedIcon ? <SelectedIcon size={20} /> : <Search size={18} />}
        </div>
        <span
          className={`flex-1 truncate ${selectedIconName ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}
        >
          {selectedIconName || 'Select icon'}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-9999 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-theme-lg overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Search Bar */}
          <div className="relative border-b border-gray-100 dark:border-gray-800 p-2">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-8 pr-8 py-1.5 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-md outline-none focus:ring-1 focus:ring-brand-500/20"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Icon Grid */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="max-h-64 overflow-y-auto p-2 custom-scrollbar"
          >
            {filteredIcons.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 italic">
                No icons found for "{searchTerm}"
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1">
                {filteredIcons.slice(0, visibleCount).map((name) => {
                  const Icon = (Icons as unknown as Record<string, LucideIcon>)[name];
                  const isSelected = selectedIconName === name;
                  return (
                    <div
                      key={name}
                      onClick={() => {
                        onChange(name);
                        setIsOpen(false);
                      }}
                      className={`
                          p-2 rounded-md flex items-center justify-center cursor-pointer transition-all
                          ${isSelected ? 'bg-brand-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}
                        `}
                      title={name}
                    >
                      {Icon && <Icon size={20} strokeWidth={2} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Loading Indicator for Infinite Scroll */}
            {visibleCount < filteredIcons.length && (
              <div className="py-2 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Loading more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;
