'use client';
import React, { useEffect, useRef, forwardRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type PropsType = {
  id: string;
  mode?: 'single' | 'multiple' | 'range' | 'time';
  value?: string | Date | null;
  onChange?: (date: Date[] | string) => void;
  label?: string;
  placeholder?: string;
  showTime?: boolean;
  error?: string;
  className?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
};

const DateTimePicker = forwardRef<HTMLInputElement, PropsType>(
  (
    {
      id,
      mode = 'single',
      value,
      onChange,
      label,
      placeholder = 'Select date...',
      showTime = false,
      error,
      className,
      minDate,
      maxDate,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fp = useRef<flatpickr.Instance | null>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    useEffect(() => {
      if (!inputRef.current) return;

      fp.current = flatpickr(inputRef.current, {
        mode,
        enableTime: showTime,
        noCalendar: mode === 'time',
        dateFormat: showTime ? 'Y-m-d h:i K' : 'Y-m-d',
        time_24hr: false,
        defaultDate: value || undefined,
        minDate,
        maxDate,
        static: true,
        monthSelectorType: 'static',
        prevArrow:
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        nextArrow:
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        onReady: (selectedDates, dateStr, instance) => {
          if (showTime) {
            const timeContainer = instance.calendarContainer.querySelector('.flatpickr-time');
            if (timeContainer && !timeContainer.querySelector('.flatpickr-now-button')) {
              const nowBtn = document.createElement('button');
              nowBtn.className =
                'flatpickr-now-button ml-2 px-2 py-1 bg-brand-500 text-white text-[10px] font-bold rounded-md hover:bg-brand-600 transition-all';
              nowBtn.innerHTML = 'NOW';
              nowBtn.type = 'button';
              nowBtn.onclick = () => {
                instance.setDate(new Date(), true);
              };
              timeContainer.appendChild(nowBtn);
            }
          }
        },
        onChange: (selectedDates, dateStr) => {
          if (onChange) {
            onChange(mode === 'single' ? dateStr : (selectedDates as Date[]));
          }
        },
      });

      return () => {
        fp.current?.destroy();
      };
    }, [mode, showTime, minDate, maxDate, onChange]);

    // Update value if changed externally
    useEffect(() => {
      if (fp.current && value !== undefined) {
        fp.current.setDate(value || '', false);
      }
    }, [value]);

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      fp.current?.clear();
      if (onChange) onChange('');
    };

    return (
      <div className={cn('w-full space-y-2', className)} ref={containerRef}>
        {label && <Label htmlFor={id}>{label}</Label>}

        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors pointer-events-none">
            {mode === 'time' ? <Clock size={18} /> : <CalendarIcon size={18} />}
          </div>

          <input
            id={id}
            ref={inputRef}
            readOnly
            placeholder={placeholder}
            className={cn(
              'h-12 w-full rounded-2xl border bg-white dark:bg-navy-900/50 pl-11 pr-10 text-sm transition-all outline-none',
              'border-gray-200 dark:border-navy-700',
              'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
              'placeholder:text-gray-400 dark:placeholder:text-navy-400',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500/10',
            )}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-error-500 mt-1 px-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  },
);

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
