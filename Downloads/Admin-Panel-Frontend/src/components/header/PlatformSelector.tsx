'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Platform {
  id: number;
  name: string;
  type: string;
}

const platforms: Platform[] = [
  {
    id: 0,
    name: 'All Platforms',
    type: 'View All Platforms',
  },
  {
    id: 1,
    name: 'CORE Media Group',
    type: 'Corporate Media Platform',
  },
  {
    id: 2,
    name: 'CIO Powerlist',
    type: 'Leadership Recognition Platform',
  },
  {
    id: 3,
    name: 'Leader Next',
    type: 'Leadership Community Platform',
  },
  {
    id: 4,
    name: 'CIO Dialogues',
    type: 'Technology Events & Dialogues',
  },
  {
    id: 5,
    name: 'CIO Crown',
    type: 'Leadership Awards Platform',
  },
  {
    id: 6,
    name: 'CIO Choice',
    type: 'ICT Awards Ecosystem',
  },
  {
    id: 7,
    name: 'CXO Capital',
    type: 'Investment & CXO Collaboration',
  },
  {
    id: 8,
    name: 'CXO Capital MEA',
    type: 'Regional Leadership Recognition',
  },
  {
    id: 9,
    name: 'MEA CIO Choice',
    type: 'MEA Region Awards Platform',
  },
  {
    id: 10,
    name: 'DCCAI 2026',
    type: 'Event / Summit Platform',
  },
  {
    id: 11,
    name: 'CIO Angel Network',
    type: 'Angel Investment Network',
  },
  {
    id: 12,
    name: 'B2B 1K',
    type: 'B2B Collaboration Ecosystem',
  },
];

export default function PlatformSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSelect = (platform: Platform) => {
    setIsOpen(false);

    if (platform.id === 0) {
      router.push('/');
      return;
    }

    router.push(`/websites/${encodeURIComponent(platform.name)}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <span className="hidden sm:inline">Platforms</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-72 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              Select Platform
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleSelect(platform)}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors text-left"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {platform.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {platform.type}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
