'use client';

import React from 'react';
import { ShieldAlert, Lock, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DevToolsBlockedModalProps {
  isOpen: boolean;
}

export const DevToolsBlockedModal: React.FC<DevToolsBlockedModalProps> = ({ isOpen }) => {
  const { logout, isLoggingOut } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-gray-950/90 backdrop-blur-2xl p-4 transition-all duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-red-500/30 bg-white/95 dark:bg-navy-900/95 p-8 text-center shadow-2xl backdrop-blur-md">
        {/* Top Glow & Badge */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 shadow-inner animate-pulse">
          <ShieldAlert size={44} className="stroke-[2.2]" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 mb-3">
          <Lock size={12} /> Data Protection Policy Enforced
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Developer Tools Restricted
        </h2>

        <p className="text-sm text-gray-600 dark:text-navy-200 mb-6 leading-relaxed">
          Accessing browser Developer Tools or inspection panels is strictly prohibited on this
          Admin Dashboard to safeguard sensitive system data and credentials.
        </p>

        <div className="rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-950/60 p-4 text-xs text-gray-500 dark:text-navy-300 text-left mb-6 space-y-1.5">
          <div className="font-semibold text-gray-700 dark:text-navy-100 mb-1">
            Required Action:
          </div>
          <p>• Close the Developer Tools inspector panel in your browser.</p>
          <p>• Dashboard access will automatically unblock once closed.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-red-600/30 active:scale-95 disabled:opacity-50"
          >
            <LogOut size={16} />
            {isLoggingOut ? 'Logging out...' : 'Logout Securely'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevToolsBlockedModal;
