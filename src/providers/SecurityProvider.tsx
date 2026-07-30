'use client';

import React from 'react';
import { useSecurityProtection } from '@/hooks/useSecurityProtection';
import SecurityWatermark from '@/components/security/SecurityWatermark';
import DevToolsBlockedModal from '@/components/security/DevToolsBlockedModal';
import ScreenshotWarningOverlay from '@/components/security/ScreenshotWarningOverlay';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { isDevToolsOpen, isBlurred, screenshotWarning } = useSecurityProtection();

  return (
    <div className="protected-content flex-1">
      <SecurityWatermark />
      <DevToolsBlockedModal isOpen={isDevToolsOpen} />
      <ScreenshotWarningOverlay isBlurred={isBlurred} screenshotWarning={screenshotWarning} />
      {children}
    </div>
  );
};

export default SecurityProvider;
