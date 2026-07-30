'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth.store';

export const SecurityWatermark: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return null;
  }

  const watermarkText = `${user.fullName || 'Admin User'} (${user.email || 'Admin'}) • SECURE SESSION • ${new Date().toISOString().split('T')[0]}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none opacity-[0.035] dark:opacity-[0.05]"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='120px' width='360px'><text transform='rotate(-22 180 60)' fill='%23666666' font-size='11' font-family='sans-serif' font-weight='bold' x='10' y='60'>${encodeURIComponent(
          watermarkText,
        )}</text></svg>")`,
        backgroundRepeat: 'repeat',
      }}
    />
  );
};

export default SecurityWatermark;
