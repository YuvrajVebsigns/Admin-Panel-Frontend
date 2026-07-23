'use client';
import React, { useEffect, useRef, forwardRef, useState } from 'react';
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

// Helper to parse value into separate date (YYYY-MM-DD) and time (hh:mm AM/PM) strings
const parseDateTimeParts = (val: string | Date | null | undefined) => {
  if (!val) return { date: '', time: '' };

  let d: Date | null = null;
  if (val instanceof Date) {
    d = val;
  } else if (typeof val === 'string' && val.trim()) {
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    } else {
      const parts = val.trim().split(/\s+/);
      const datePart = parts[0] || '';
      const timePart = parts.slice(1).join(' ') || '';
      return { date: datePart, time: timePart };
    }
  }

  if (d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');

    return {
      date: `${year}-${month}-${day}`,
      time: `${strHours}:${minutes} ${ampm}`,
    };
  }

  return { date: '', time: '' };
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
    const dateInputRef = useRef<HTMLInputElement>(null);
    const timeInputRef = useRef<HTMLInputElement>(null);
    const singleInputRef = useRef<HTMLInputElement>(null);

    const dateFp = useRef<flatpickr.Instance | null>(null);
    const timeFp = useRef<flatpickr.Instance | null>(null);
    const singleFp = useRef<flatpickr.Instance | null>(null);

    React.useImperativeHandle(ref, () =>
      showTime ? dateInputRef.current! : singleInputRef.current!,
    );

    const parts = parseDateTimeParts(value);
    const [selectedDate, setSelectedDate] = useState<string>(parts.date);
    const [selectedTime, setSelectedTime] = useState<string>(parts.time);

    // Keep internal states in sync with external value
    useEffect(() => {
      const p = parseDateTimeParts(value);
      setSelectedDate(p.date);
      setSelectedTime(p.time);
    }, [value]);

    // Handle Split Date + Time Mode (showTime = true)
    useEffect(() => {
      if (!showTime) return;

      if (dateInputRef.current) {
        dateFp.current = flatpickr(dateInputRef.current, {
          mode: 'single',
          enableTime: false,
          dateFormat: 'Y-m-d',
          defaultDate: selectedDate || undefined,
          minDate,
          maxDate,
          monthSelectorType: 'static',
          prevArrow:
            '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          nextArrow:
            '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          onChange: (selectedDates, dateStr) => {
            setSelectedDate(dateStr);
            if (onChange) {
              const time = selectedTime || '09:00 AM';
              onChange(dateStr ? `${dateStr} ${time}` : '');
            }
          },
        });
      }

      if (timeInputRef.current) {
        timeFp.current = flatpickr(timeInputRef.current, {
          enableTime: true,
          noCalendar: true,
          dateFormat: 'h:i K',
          time_24hr: false,
          defaultDate: selectedTime || undefined,
          onReady: (selectedDates, dateStr, instance) => {
            const timeContainer = instance.calendarContainer.querySelector('.flatpickr-time');
            if (timeContainer && !timeContainer.querySelector('.flatpickr-now-button')) {
              const nowBtn = document.createElement('button');
              nowBtn.className =
                'flatpickr-now-button ml-2 px-2 py-1 bg-brand-500 text-white text-[10px] font-bold rounded-md hover:bg-brand-600 transition-all';
              nowBtn.innerHTML = 'NOW';
              nowBtn.type = 'button';
              nowBtn.onclick = () => {
                const now = new Date();
                instance.setDate(now, true);
              };
              timeContainer.appendChild(nowBtn);
            }
          },
          onChange: (selectedDates, dateStr) => {
            setSelectedTime(dateStr);
            if (onChange && selectedDate) {
              onChange(`${selectedDate} ${dateStr}`);
            }
          },
        });
      }

      return () => {
        dateFp.current?.destroy();
        timeFp.current?.destroy();
      };
    }, [showTime]);

    // Handle Single Date Mode (showTime = false)
    useEffect(() => {
      if (showTime || !singleInputRef.current) return;

      singleFp.current = flatpickr(singleInputRef.current, {
        mode,
        enableTime: false,
        dateFormat: 'Y-m-d',
        defaultDate: value || undefined,
        minDate,
        maxDate,
        monthSelectorType: 'static',
        prevArrow:
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        nextArrow:
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        onChange: (selectedDates, dateStr) => {
          if (onChange) {
            onChange(mode === 'single' ? dateStr : (selectedDates as Date[]));
          }
        },
      });

      return () => {
        singleFp.current?.destroy();
      };
    }, [showTime, mode]);

    // Dynamic minDate / maxDate updates
    useEffect(() => {
      if (dateFp.current) {
        dateFp.current.set('minDate', minDate || undefined);
        dateFp.current.set('maxDate', maxDate || undefined);
      }
      if (singleFp.current) {
        singleFp.current.set('minDate', minDate || undefined);
        singleFp.current.set('maxDate', maxDate || undefined);
      }
    }, [minDate, maxDate]);

    // External value updates
    useEffect(() => {
      if (showTime) {
        const p = parseDateTimeParts(value);
        if (dateFp.current) dateFp.current.setDate(p.date || '', false);
        if (timeFp.current) timeFp.current.setDate(p.time || '', false);
      } else if (singleFp.current && value !== undefined) {
        singleFp.current.setDate(value || '', false);
      }
    }, [value, showTime]);

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (showTime) {
        dateFp.current?.clear();
        timeFp.current?.clear();
        setSelectedDate('');
        setSelectedTime('');
      } else {
        singleFp.current?.clear();
      }
      if (onChange) onChange('');
    };

    return (
      <div className={cn('w-full space-y-2', className)} ref={containerRef}>
        {label && <Label htmlFor={id}>{label}</Label>}

        {showTime ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date Input */}
            <div className="relative group cursor-pointer" onClick={() => dateFp.current?.open()}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors pointer-events-none z-10">
                <CalendarIcon size={18} />
              </div>
              <input
                id={id}
                ref={dateInputRef}
                readOnly
                placeholder="Select date..."
                className={cn(
                  'h-12 w-full rounded-2xl border bg-white dark:bg-navy-900/50 pl-11 pr-10 text-sm transition-all outline-none cursor-pointer',
                  'border-gray-200 dark:border-navy-700',
                  'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
                  'placeholder:text-gray-400 dark:placeholder:text-navy-400',
                  error && 'border-error-500 focus:border-error-500 focus:ring-error-500/10',
                )}
              />
            </div>

            {/* Time Input */}
            <div className="relative group cursor-pointer" onClick={() => timeFp.current?.open()}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors pointer-events-none z-10">
                <Clock size={18} />
              </div>
              <input
                ref={timeInputRef}
                readOnly
                placeholder="Select time..."
                className={cn(
                  'h-12 w-full rounded-2xl border bg-white dark:bg-navy-900/50 pl-11 pr-10 text-sm transition-all outline-none cursor-pointer',
                  'border-gray-200 dark:border-navy-700',
                  'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
                  'placeholder:text-gray-400 dark:placeholder:text-navy-400',
                  error && 'border-error-500 focus:border-error-500 focus:ring-error-500/10',
                )}
              />
              {value && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Single Date Input */
          <div className="relative group cursor-pointer" onClick={() => singleFp.current?.open()}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors pointer-events-none z-10">
              {mode === 'time' ? <Clock size={18} /> : <CalendarIcon size={18} />}
            </div>

            <input
              id={id}
              ref={singleInputRef}
              readOnly
              placeholder={placeholder}
              className={cn(
                'h-12 w-full rounded-2xl border bg-white dark:bg-navy-900/50 pl-11 pr-10 text-sm transition-all outline-none cursor-pointer',
                'border-gray-200 dark:border-navy-700',
                'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
                'placeholder:text-gray-400 dark:placeholder:text-navy-400',
                error && 'border-error-500 focus:border-error-500 focus:ring-error-500/10',
              )}
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
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
        )}

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
