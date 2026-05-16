'use client';

import { useEffect, useState } from 'react';
import { systemService, ConnectionTestResponse } from '@/services/system.service';
import { ConnectionStatus } from '@/modules/system/components/ConnectionStatus';
import { Loader2, RefreshCcw, AlertTriangle } from 'lucide-react';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<ConnectionTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await systemService.testConnection();
      setData(res);
      setStatus('success');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect to backend services';
      setError(errorMessage);
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      {/* Subtle background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-20 lg:py-32">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
              Running system diagnostics...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="max-w-xl mx-auto text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="inline-flex p-4 rounded-3xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 text-rose-500">
              <AlertTriangle size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Connection Failed
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                We couldn't reach the backend API at{' '}
                <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-rose-500 font-mono text-sm">
                  {process.env.NEXT_PUBLIC_API_URL}
                </code>
              </p>
            </div>

            <div className="p-6 bg-rose-50/50 dark:bg-rose-900/5 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-left">
              <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">
                Error Log
              </p>
              <pre className="text-sm font-mono text-rose-600 dark:text-rose-400 break-words whitespace-pre-wrap">
                {error}
              </pre>
            </div>

            <button
              onClick={fetchStatus}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
            >
              <RefreshCcw size={20} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {status === 'success' && data && (
          <div className="space-y-12">
            <ConnectionStatus data={data} />

            <div className="flex justify-center">
              <button
                onClick={fetchStatus}
                className="group flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-xl transition-all hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm hover:shadow-md"
              >
                <RefreshCcw
                  size={18}
                  className="group-hover:rotate-180 transition-transform duration-500"
                />
                <span>Refresh Diagnostics</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
