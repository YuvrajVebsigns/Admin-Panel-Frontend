'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { systemService, ConnectionTestResponse } from '@/services/system.service';

export const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [details, setDetails] = useState<ConnectionTestResponse | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const response = await systemService.testConnection();
      if (response && response.connectivity) {
        setDetails(response);
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      // Silently fail connection check to avoid console noise in production
      setStatus('offline');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="group relative">
      <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-white/50 dark:bg-navy-800/50 backdrop-blur-sm border border-gray-100 dark:border-navy-700 shadow-sm cursor-help">
        {status === 'checking' && (
          <>
            <Loader2 size={12} className="animate-spin text-gray-400" />
            <span className="text-gray-500">Checking API connection...</span>
          </>
        )}
        {(status === 'online' || status === 'offline') && (
          <>
            <div
              className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            />
            <span
              className={
                status === 'online' ? 'text-green-600 dark:text-green-400' : 'text-brand-500'
              }
            >
              API {status === 'online' ? 'Online' : 'Offline'}
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-[10px] ml-1">
              ({details?.environment || 'checking...'})
            </span>
          </>
        )}
      </div>

      {/* Hover Details Card */}
      {details && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-navy-700 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none transition-all duration-300 z-50">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-navy-700 pb-2">
              Service Status
            </h4>

            <ServiceRow
              label="Database"
              status={details.services.database.status}
              subLabel={details.services.database.type ? `(${details.services.database.type})` : ''}
            />
            <ServiceRow
              label="Cache"
              status={details.services.redis.status}
              subLabel={details.services.redis.type ? `(${details.services.redis.type})` : ''}
            />
            <ServiceRow
              label="Storage"
              status={details.services.storage.status}
              subLabel={details.services.storage.type ? `(${details.services.storage.type})` : ''}
            />

            <div className="pt-2 mt-2 border-t border-gray-50 dark:border-navy-700">
              <p className="text-[10px] text-gray-400 italic">
                Last checked: {new Date(details.serverTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-white dark:border-t-navy-800" />
        </div>
      )}
    </div>
  );
};

const ServiceRow: React.FC<{ label: string; status: 'up' | 'down'; subLabel?: string }> = ({
  label,
  status,
  subLabel,
}) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex flex-col">
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      {subLabel && <span className="text-[10px] text-gray-400 font-normal">{subLabel}</span>}
    </div>
    <div className="flex items-center gap-1.5">
      <span className={status === 'up' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
        {status.toUpperCase()}
      </span>
      <div
        className={`w-1.5 h-1.5 rounded-full ${status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
      />
    </div>
  </div>
);
