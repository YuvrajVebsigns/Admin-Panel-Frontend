'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  useDeploymentTargets,
  usePm2Status,
  useDeployLogs,
  usePm2Logs,
  useRestartLogs,
  useTriggerDeployMutation,
  useRestartPm2Mutation,
} from '@/modules/deployments/hooks/useDeployments';
import {
  Terminal,
  Play,
  RefreshCw,
  GitBranch,
  Folder,
  Cpu,
  HardDrive,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Trash2,
  Server,
  Layers,
  ChevronDown,
} from 'lucide-react';
import Button from '@/components/ui/button/Button';
import toast from 'react-hot-toast';

export default function DeploymentsPage() {
  const { targets, isLoading: isLoadingTargets, refetch: refetchTargets } = useDeploymentTargets();
  const { processes, isLoading: isLoadingProcesses, refetch: refetchProcesses } = usePm2Status();

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [activeLogTab, setActiveLogTab] = useState<'deploy' | 'pm2' | 'restart'>('deploy');
  const [terminalLogs, setTerminalLogs] = useState<string>('');

  const triggerDeployMutation = useTriggerDeployMutation();
  const restartPm2Mutation = useRestartPm2Mutation();

  // Queries for logs based on selection
  const { logs: deployLogs, refetch: refetchDeployLogs } = useDeployLogs(
    activeLogTab === 'deploy' ? selectedTarget : null,
  );
  const { logs: pm2Logs, refetch: refetchPm2Logs } = usePm2Logs(
    activeLogTab === 'pm2' ? selectedTarget : null,
  );
  const { logs: restartLogs, refetch: refetchRestartLogs } = useRestartLogs(
    activeLogTab === 'restart' ? selectedTarget : null,
  );

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Set initial selected target when targets load
  useEffect(() => {
    const firstTarget = targets[0];
    if (firstTarget && !selectedTarget) {
      setSelectedTarget(firstTarget.id);
    }
  }, [targets, selectedTarget]);

  // Update terminal output when queries return
  useEffect(() => {
    if (activeLogTab === 'deploy') {
      setTerminalLogs(deployLogs);
    } else if (activeLogTab === 'pm2') {
      setTerminalLogs(pm2Logs);
    } else if (activeLogTab === 'restart') {
      setTerminalLogs(restartLogs);
    }
  }, [activeLogTab, deployLogs, pm2Logs, restartLogs]);

  // Auto-scroll terminal to bottom when logs change
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Helper to format bytes to megabytes
  const formatRAM = (bytes?: number) => {
    if (!bytes) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to format seconds to human-readable uptime
  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'Offline';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // Find PM2 process details for a deployment target
  const getProcessForTarget = (targetId: string) => {
    if (targetId === 'backend') {
      return processes.find((p) => p.name === 'core-media-backend');
    }
    if (targetId === 'frontend') {
      return processes.find((p) => p.name === 'core-media-frontend');
    }

    // Website mapping: Find process matching target name or slug
    const target = targets.find((t) => t.id === targetId);
    if (target && target.name) {
      const match = processes.find(
        (p) => p.name === target.name.toLowerCase().replace(/\s+/g, '-') || p.name === targetId,
      );
      if (match) return match;
    }

    // Fallback: match by process index or default PM2 list name mapping
    const matchIdx = parseInt(targetId.replace('website-', ''), 10) - 1;
    const dbWebsiteSlug = processes[matchIdx + 2]; // skip backend/frontend in generic lists
    return dbWebsiteSlug;
  };

  // Reload all data
  const handleRefreshAll = async () => {
    await Promise.all([refetchTargets(), refetchProcesses()]);
    if (selectedTarget) {
      if (activeLogTab === 'deploy') refetchDeployLogs();
      if (activeLogTab === 'pm2') refetchPm2Logs();
      if (activeLogTab === 'restart') refetchRestartLogs();
    }
    toast.success('Metrics and logs refreshed');
  };

  const handleCopyLogs = () => {
    if (!terminalLogs) return;
    navigator.clipboard.writeText(terminalLogs);
    toast.success('Logs copied to clipboard');
  };

  const handleClearTerminal = () => {
    setTerminalLogs('');
    toast.success('Console cleared locally');
  };

  // Determine system overview stats
  const totalProcesses = processes.length;
  const onlineProcesses = processes.filter((p) => p.status === 'online').length;
  const averageCpu =
    processes.length > 0
      ? (processes.reduce((sum, p) => sum + (p.cpu || 0), 0) / processes.length).toFixed(1)
      : '0.0';

  if (isLoadingTargets || isLoadingProcesses) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading deployment console...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Server className="text-brand-500" size={28} />
            Deployment & Server Control
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Super Admin operations desk for production servers, websites, background deployments,
            and PM2 logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border-gray-200 dark:border-navy-700"
            onClick={handleRefreshAll}
          >
            <RefreshCw size={16} />
            Refresh Panel
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 flex items-center gap-5 shadow-xs transition-colors duration-300">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-navy-300 uppercase tracking-wider">
              Total Targets
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {targets.length}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 flex items-center gap-5 shadow-xs transition-colors duration-300">
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-navy-300 uppercase tracking-wider">
              Online Processes
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {onlineProcesses}{' '}
              <span className="text-xs text-gray-400 font-normal">/ {totalProcesses}</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 flex items-center gap-5 shadow-xs transition-colors duration-300">
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Cpu size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-navy-300 uppercase tracking-wider">
              Avg Process CPU
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{averageCpu}%</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 flex items-center gap-5 shadow-xs transition-colors duration-300">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-navy-300 uppercase tracking-wider">
              Server Status
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping inline-block"></span>
              Operational
            </h3>
          </div>
        </div>
      </div>

      {/* Deployment Targets Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Deployment Registry Targets
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {targets.map((target) => {
            const proc = getProcessForTarget(target.id);
            const isDeploying = target.status === 'deploying';

            return (
              <div
                key={target.id}
                className={`bg-white dark:bg-navy-800 border rounded-3xl p-6 shadow-xs relative transition-all duration-300 ${
                  selectedTarget === target.id
                    ? 'border-brand-500 ring-2 ring-brand-500/10 dark:border-brand-500/50'
                    : 'border-gray-200 dark:border-navy-700 hover:border-gray-300 dark:hover:border-navy-600'
                }`}
                onClick={() => setSelectedTarget(target.id)}
              >
                {/* Target Title & Type Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug cursor-pointer hover:text-brand-500 transition-colors">
                      {target.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{target.id}</p>
                  </div>

                  {/* Target Type Badge */}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      target.id === 'backend'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                        : target.id === 'frontend'
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                          : 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400'
                    }`}
                  >
                    {target.id === 'backend'
                      ? 'Backend'
                      : target.id === 'frontend'
                        ? 'Frontend'
                        : 'Website'}
                  </span>
                </div>

                {/* Git branch and Directory */}
                <div className="mt-4 space-y-2 border-y border-gray-50 dark:border-navy-700/50 py-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-navy-200">
                    <GitBranch size={14} className="text-gray-400" />
                    <span
                      className="font-mono text-gray-700 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap"
                      title={target.branch}
                    >
                      {target.branch.replace('refs/heads/', '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-navy-200">
                    <Folder size={14} className="text-gray-400" />
                    <span
                      className="font-mono text-gray-700 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap"
                      title={target.directory}
                    >
                      {target.directory || '/default/root'}
                    </span>
                  </div>
                </div>

                {/* PM2 Metric Stats */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-50 dark:bg-navy-900/50 rounded-xl p-2">
                    <Cpu size={12} className="mx-auto mb-1 text-gray-400" />
                    <p className="text-[10px] text-gray-400 dark:text-navy-300">CPU</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                      {proc?.status === 'online' ? `${proc.cpu}%` : '0%'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-navy-900/50 rounded-xl p-2">
                    <HardDrive size={12} className="mx-auto mb-1 text-gray-400" />
                    <p className="text-[10px] text-gray-400 dark:text-navy-300">RAM</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                      {proc?.status === 'online' ? formatRAM(proc.memory) : '0 MB'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-navy-900/50 rounded-xl p-2">
                    <Clock size={12} className="mx-auto mb-1 text-gray-400" />
                    <p className="text-[10px] text-gray-400 dark:text-navy-300">Uptime</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                      {proc?.status === 'online' ? formatUptime(proc.uptime) : 'Offline'}
                    </p>
                  </div>
                </div>

                {/* Deployment Status & PM2 Status Banner */}
                <div className="mt-4 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Deploy:</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        target.status === 'success'
                          ? 'text-green-500'
                          : target.status === 'failed'
                            ? 'text-red-500'
                            : target.status === 'deploying'
                              ? 'text-blue-500 animate-pulse'
                              : 'text-gray-500'
                      }`}
                    >
                      {isDeploying && <Loader2 size={12} className="animate-spin" />}
                      {!isDeploying && target.status === 'success' && <CheckCircle size={12} />}
                      {!isDeploying && target.status === 'failed' && <XCircle size={12} />}
                      {target.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">PM2:</span>
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold ${
                        proc?.status === 'online' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          proc?.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></span>
                      {proc?.status ? proc.status.toUpperCase() : 'STOPPED'}
                    </span>
                  </div>
                </div>

                {/* Operations Buttons */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 dark:border-navy-700/50 pt-4">
                  <Button
                    variant="primary"
                    disabled={isDeploying || triggerDeployMutation.isPending || !target.isActive}
                    className="w-full text-xs py-2 px-3 shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Are you sure you want to trigger background deploy command for "${target.name}"?`,
                        )
                      ) {
                        triggerDeployMutation.mutate(target.id);
                      }
                    }}
                  >
                    <Play size={12} />
                    Deploy
                  </Button>
                  <Button
                    variant="outline"
                    disabled={restartPm2Mutation.isPending || !target.isActive}
                    className="w-full text-xs py-2 px-3 flex items-center justify-center gap-1.5 border-gray-200 dark:border-navy-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Are you sure you want to run process restart command for "${target.name}"?`,
                        )
                      ) {
                        restartPm2Mutation.mutate(target.id);
                      }
                    }}
                  >
                    <RefreshCw size={12} />
                    Restart
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal logs control desk */}
      <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl overflow-hidden shadow-xs transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-navy-700 bg-gray-50/30 dark:bg-navy-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
              <Terminal size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Process Terminal Console</h3>
              <p className="text-xs text-gray-500">
                View real-time deployment transcripts and node process logs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Target Select Dropdown */}
            <div className="relative">
              <select
                value={selectedTarget || ''}
                onChange={(e) => setSelectedTarget(e.target.value || null)}
                className="appearance-none w-48 bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-gray-700 dark:text-white focus:outline-hidden cursor-pointer"
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={14}
              />
            </div>

            {/* Log Type Selection Tabs */}
            <div className="flex rounded-xl bg-gray-100 dark:bg-navy-900 p-0.5 border border-gray-200/50 dark:border-navy-700/50">
              <button
                onClick={() => setActiveLogTab('deploy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLogTab === 'deploy'
                    ? 'bg-white dark:bg-navy-800 text-brand-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                Deploy Output
              </button>
              <button
                onClick={() => setActiveLogTab('pm2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLogTab === 'pm2'
                    ? 'bg-white dark:bg-navy-800 text-brand-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                PM2 Process Logs
              </button>
              <button
                onClick={() => setActiveLogTab('restart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLogTab === 'restart'
                    ? 'bg-white dark:bg-navy-800 text-brand-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                Restart Logs
              </button>
            </div>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400 bg-gray-50 dark:bg-navy-900/50 px-4 py-2.5 rounded-2xl border border-gray-100 dark:border-navy-700/30">
            <div className="flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              </span>
              <span className="font-mono ml-2 text-gray-500 dark:text-gray-400">
                {selectedTarget ? `${selectedTarget}@server:${activeLogTab}_logs` : 'disconnected'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyLogs}
                disabled={!terminalLogs}
                className="flex items-center gap-1 hover:text-brand-500 transition-colors disabled:opacity-50"
                title="Copy logs to clipboard"
              >
                <Copy size={13} />
                <span>Copy</span>
              </button>
              <button
                onClick={handleClearTerminal}
                disabled={!terminalLogs}
                className="flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Clear console view"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
              <button
                onClick={async () => {
                  if (activeLogTab === 'deploy') await refetchDeployLogs();
                  if (activeLogTab === 'pm2') await refetchPm2Logs();
                  if (activeLogTab === 'restart') await refetchRestartLogs();
                  toast.success('Logs refreshed');
                }}
                className="flex items-center gap-1 hover:text-brand-500 transition-colors"
                title="Fetch latest log lines"
              >
                <RefreshCw size={13} />
                <span>Reload</span>
              </button>
            </div>
          </div>

          <div className="bg-navy-950 dark:bg-black border border-navy-800 dark:border-navy-900 rounded-3xl p-6 font-mono text-xs text-green-400 overflow-y-auto h-[450px] shadow-inner relative select-text leading-relaxed">
            {terminalLogs ? (
              <pre className="whitespace-pre-wrap font-mono break-all selection:bg-brand-500/30 selection:text-white">
                {terminalLogs}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 dark:text-navy-400 gap-2 select-none">
                <Terminal size={32} strokeWidth={1} />
                <p>Console idle. Select a target and log type above.</p>
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
