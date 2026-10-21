'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp, LogOut } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/context/SidebarContext';

export default function SidebarUserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const showText = isExpanded || isHovered || isMobileOpen;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      setIsOpen(false);
      router.push('/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="relative border-t border-navy-100 p-4 dark:border-navy-800">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label="Account options"
        aria-expanded={isOpen}
        aria-controls="sidebar-account-options"
        className="admin-action dropdown-toggle flex min-h-11 w-full items-center gap-3 rounded-lg text-left text-navy-700 transition-colors hover:bg-navy-25 dark:text-navy-200 dark:hover:bg-navy-800"
      >
        <span className="size-10 shrink-0 overflow-hidden rounded-full bg-navy-50 dark:bg-navy-800">
          <Image
            width={40}
            height={40}
            src={user?.profileImage || '/images/user/owner.jpg'}
            alt=""
            className="size-full object-cover"
          />
        </span>
        {showText && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-navy-800 dark:text-white">
                {user?.fullName || 'Your account'}
              </span>
              <span className="block truncate text-xs text-navy-500 dark:text-navy-300">
                {user?.role?.name || 'Administrator'}
              </span>
            </span>
            <ChevronUp
              size={16}
              aria-hidden="true"
              className={`shrink-0 motion-safe:transition-transform motion-safe:duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className={`${showText ? 'left-4 right-4' : 'left-full right-auto ml-2 w-60'} bottom-full mb-2 flex flex-col rounded-xl p-3`}
      >
        <div id="sidebar-account-options">
          <div className="border-b border-navy-100 px-2 pb-3 dark:border-navy-700">
            <p className="truncate text-sm font-semibold text-navy-800 dark:text-white">
              {user?.fullName || 'Your account'}
            </p>
            {user?.email && (
              <p className="mt-1 truncate text-xs text-navy-500 dark:text-navy-300">{user.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="admin-action mt-2 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-navy-700 transition-colors hover:bg-brand-25 hover:text-brand-700 disabled:opacity-50 dark:text-navy-200 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
          >
            <LogOut size={18} aria-hidden="true" />
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
