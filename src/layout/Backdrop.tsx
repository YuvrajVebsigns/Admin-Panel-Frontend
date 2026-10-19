'use client';
import { useSidebar } from '@/context/SidebarContext';
import React from 'react';

const Backdrop: React.FC = () => {
  const { isMobileOpen, closeMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 bg-navy-950/60 lg:hidden"
      onClick={closeMobileSidebar}
    />
  );
};

export default Backdrop;
