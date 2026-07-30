'use client';

import React from 'react';
import { EyeOff, AlertTriangle } from 'lucide-react';

interface ScreenshotWarningOverlayProps {
  isBlurred: boolean;
  screenshotWarning: boolean;
}

export const ScreenshotWarningOverlay: React.FC<ScreenshotWarningOverlayProps> = ({
  isBlurred,
  screenshotWarning,
}) => {
  if (!isBlurred && !screenshotWarning) return null;

  return (
    <>
      {/* 1. Window Unfocused / Screen-capture opaque protective curtain */}
      {isBlurred && !screenshotWarning && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-gray-950 text-white select-none transition-none">
          <div className="flex flex-col items-center gap-3 text-center p-6 max-w-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 border border-gray-800 text-brand-400 shadow-xl">
              <EyeOff size={36} />
            </div>
            <h3 className="text-xl font-bold">Admin Content Protected</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Screen content is hidden while window focus is lost to prevent background screenshot
              captures.
            </p>
          </div>
        </div>
      )}

      {/* 2. Screenshot Shortcut Trigger Warning Modal */}
      {screenshotWarning && (
        <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-gray-950 text-white p-4 select-none transition-none">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-gray-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
              <AlertTriangle size={36} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Screenshot Attempt Blocked</h3>

            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              Taking screenshots or using screen recording/clipping tools is strictly prohibited on
              the Admin Panel. For security compliance, your session has been automatically
              terminated.
            </p>

            <div className="rounded-xl bg-red-950/60 border border-red-500/30 p-3.5 text-xs text-red-300 font-semibold tracking-wide uppercase">
              Clipboard Cleared • Session Terminated • Logging Out...
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScreenshotWarningOverlay;
