'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/services/apiFetch';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Testing /system-users since the root / might not exist in v1
        const res = await apiFetch<unknown>('/system-users', { requireAuth: false });
        setData(res);
        setStatus('success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
        setError(errorMessage);
        setStatus('error');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Backend Connection Test
        </h1>

        <div className="mb-6 space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <strong>Target URL:</strong> {process.env.NEXT_PUBLIC_API_URL}/system-users
          </p>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Status:</span>
            {status === 'loading' && (
              <span className="text-blue-500 animate-pulse">Connecting...</span>
            )}
            {status === 'success' && (
              <span className="text-green-500">✅ Connected Successfully</span>
            )}
            {status === 'error' && <span className="text-red-500">❌ Connection Failed</span>}
          </div>
        </div>

        {status === 'error' && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 mb-6 text-sm font-mono">
            {error}
          </div>
        )}

        {Boolean(data) && (
          <div className="mt-4">
            <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-2">
              Sample Data from /system-users:
            </span>
            <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs overflow-auto max-h-60 text-gray-600 dark:text-gray-400">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <button
          onClick={() => window.location.reload()}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 mt-6"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
