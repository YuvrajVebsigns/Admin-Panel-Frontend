'use client';
import React, { useRef, useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full' | 'auto';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isFullscreen = false,
  title,
  size = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation on next frame for enter transition
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    '3xl': 'max-w-6xl',
    '4xl': 'max-w-7xl',
    '5xl': 'max-w-[90vw]',
    '6xl': 'max-w-[95vw]',
    full: 'max-w-full mx-4',
    auto: 'max-w-fit',
  };

  const contentClasses = isFullscreen
    ? 'w-full h-full'
    : `relative w-full ${sizeClasses[size]} rounded-2xl bg-white dark:bg-navy-800 shadow-2xl border border-gray-100 dark:border-navy-700 overflow-hidden`;

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-999999">
      {/* Backdrop */}
      {!isFullscreen && (
        <div
          className={`fixed inset-0 h-full w-full bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
      )}

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`${contentClasses} transition-all duration-300 ease-out ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-50 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100/80 text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 hover:ring-2 hover:ring-gray-200 dark:bg-navy-700/80 dark:text-gray-400 dark:hover:bg-navy-600 dark:hover:text-white dark:hover:ring-navy-600 sm:right-4 sm:top-4 sm:h-9 sm:w-9"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}

        {/* Title Bar with accent */}
        {title && (
          <div className="relative px-6 py-5 border-b border-gray-100 dark:border-navy-700">
            {/* Brand accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-10">{title}</h3>
          </div>
        )}

        {/* Content Area */}
        <div className={title ? 'px-6 pb-6 pt-5' : 'p-0'}>{children}</div>
      </div>
    </div>
  );
};
