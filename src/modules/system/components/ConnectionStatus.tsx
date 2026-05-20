'use client';

import React from 'react';
import { ConnectionTestResponse } from '@/services/system.service';
import {
  CheckCircleIcon,
  XCircleIcon,
  ServerIcon,
  DatabaseIcon,
  CpuIcon,
  CloudIcon,
} from 'lucide-react';

interface ConnectionStatusProps {
  data: ConnectionTestResponse;
}

const ServiceCard = ({
  name,
  status,
  message,
  type,
  icon: Icon,
}: {
  name: string;
  status: 'up' | 'down';
  message?: string;
  type?: string;
  icon: React.ElementType;
}) => {
  const isUp = status === 'up';

  return (
    <div
      className={`p-6 rounded-2xl border transition-all duration-300 ${
        isUp
          ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1'
          : 'bg-rose-50/30 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30 hover:shadow-lg hover:shadow-rose-500/5 hover:-translate-y-1'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-xl ${
              isUp
                ? 'bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-100 dark:bg-rose-800/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            <Icon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
              {type && (
                <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                  {type}
                </span>
              )}
            </div>
            <div className="flex items-center mt-1">
              <span
                className={`flex h-2 w-2 rounded-full mr-2 ${isUp ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
              />
              <span
                className={`text-sm font-medium ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
              >
                {isUp ? 'Operational' : 'Service Down'}
              </span>
            </div>
          </div>
        </div>
        {isUp ? (
          <CheckCircleIcon className="text-emerald-500" size={20} />
        ) : (
          <XCircleIcon className="text-rose-500" size={20} />
        )}
      </div>
      {(message || type) && (
        <div className="mt-4 space-y-2">
          {message && (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-gray-100 dark:border-gray-800 break-words">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ data }) => {
  const { services, status, message, environment, serverTime } = data;

  const statusColors = {
    online: 'from-emerald-500 to-teal-500',
    partial_outage: 'from-amber-500 to-orange-500',
    offline: 'from-rose-500 to-red-500',
  };

  const statusBg = {
    online: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    partial_outage: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    offline: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Status Header */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl">
        <div
          className={`absolute top-0 right-0 w-64 h-64 opacity-10 bg-gradient-to-br ${statusColors[status]} blur-3xl -mr-20 -mt-20`}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusBg[status]}`}
              >
                {status.replace('_', ' ')}
              </div>
              <span className="text-sm text-gray-400 font-mono">{environment}</span>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              System Diagnostics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg">{message}</p>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
                Server Time
              </p>
              <p className="text-lg font-mono text-gray-700 dark:text-gray-300">
                {new Date(serverTime).toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-500">{new Date(serverTime).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ServiceCard
          name="Core Database"
          status={services.database.status}
          message={services.database.message}
          type={services.database.type}
          icon={DatabaseIcon}
        />
        <ServiceCard
          name="Redis Cache"
          status={services.redis.status}
          message={services.redis.message}
          type={services.redis.type}
          icon={CpuIcon}
        />
        <ServiceCard
          name="Media Storage"
          status={services.storage.status}
          message={services.storage.message}
          type={services.storage.type}
          icon={CloudIcon}
        />
      </div>

      {/* Connectivity Detail */}
      <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ServerIcon className="text-gray-400" size={20} />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            API Connectivity Check
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono text-gray-500 uppercase">Latency: Minimal</span>
        </div>
      </div>
    </div>
  );
};
