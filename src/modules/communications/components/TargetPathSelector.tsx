'use client';

import React, { useMemo } from 'react';
import { CommunicationVariable, CommunicationChannel } from '../types/communication.types';
import { useFetchVariables } from '../hooks/useVariables';
import { AlertTriangle, ChevronDown } from 'lucide-react';

/**
 * Convert dot-notation path segments into human-friendly breadcrumb trail.
 * e.g. "nominatorId.email" → "Nominator ➔ Email Address"
 */
function formatPathBreadcrumb(path: string): string {
  const labelMap: Record<string, string> = {
    email: 'Email Address',
    phone: 'Phone Number',
    mobile: 'Mobile Number',
    name: 'Full Name',
    firstName: 'First Name',
    lastName: 'Last Name',
    fullName: 'Full Name',
    nominatorId: 'Nominator',
    registreeId: 'Registree',
    attendeeId: 'Attendee',
    eventId: 'Event',
    sponsorId: 'Sponsor',
    userId: 'User',
    blogId: 'Blog',
    websiteId: 'Website',
    contactId: 'Contact',
    nominatorEmail: 'Nominator Email',
    nomineeEmails: 'Nominee Emails',
    authorEmail: 'Author Email',
  };

  const directMatch = labelMap[path];
  if (directMatch) return directMatch;

  return path
    .split('.')
    .map((segment) => {
      const mapped = labelMap[segment];
      if (mapped) return mapped;

      // Capitalize camelCase into words
      const spaced = segment
        .replace(/Id$/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim();
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    })
    .join(' ➔ ');
}

/** Map model names to emoji prefixes for visual grouping */
function getModelIcon(modelName: string): string {
  const iconMap: Record<string, string> = {
    Registree: '🎫',
    Nomination: '🏆',
    Event: '📅',
    Blog: '📝',
    Contact: '📬',
    Sponsor: '💼',
    Website: '🌐',
  };
  return iconMap[modelName] || '📌';
}

/** Filter variables based on channel type */
function filterVariablesByChannel(
  vars: CommunicationVariable[],
  channel?: string,
): CommunicationVariable[] {
  if (!channel) return vars;

  if (channel === CommunicationChannel.EMAIL) {
    return vars.filter(
      (v) => v.path.toLowerCase().includes('email') || v.type?.toLowerCase() === 'email',
    );
  }
  if (channel === CommunicationChannel.SMS) {
    return vars.filter(
      (v) => v.path.toLowerCase().includes('phone') || v.path.toLowerCase().includes('mobile'),
    );
  }
  return vars;
}

interface TargetPathSelectorProps {
  value: string;
  onChange: (value: string) => void;
  modelName?: string;
  channel?: string;
  disabled?: boolean;
}

export const TargetPathSelector: React.FC<TargetPathSelectorProps> = ({
  value,
  onChange,
  modelName,
  channel,
  disabled = false,
}) => {
  // Always fetch all sender-compatible variables (isSenderVariable: true)
  const { data: allVariablesResponse, isLoading } = useFetchVariables({
    limit: 200,
    isActive: true,
    isSenderVariable: true,
  });

  // All sender variables across all models
  const allSenderVariables: CommunicationVariable[] = useMemo(
    () => allVariablesResponse?.data || [],
    [allVariablesResponse],
  );

  // If modelName is set, prioritize those; otherwise use all
  const senderVariables: CommunicationVariable[] = useMemo(() => {
    if (!modelName) return allSenderVariables;
    const modelVars = allSenderVariables.filter((v) => v.modelName === modelName);
    return modelVars.length > 0 ? modelVars : allSenderVariables;
  }, [allSenderVariables, modelName]);

  const filteredVariables = useMemo(
    () => filterVariablesByChannel(senderVariables, channel),
    [senderVariables, channel],
  );

  // Group variables by modelName for organized dropdown
  const groupedVariables = useMemo(() => {
    const groups: Record<string, CommunicationVariable[]> = {};
    const varsToGroup =
      filteredVariables.length > 0
        ? filteredVariables
        : filterVariablesByChannel(allSenderVariables, channel);

    for (const v of varsToGroup) {
      const list = groups[v.modelName] || [];
      list.push(v);
      groups[v.modelName] = list;
    }
    return groups;
  }, [filteredVariables, allSenderVariables, channel]);

  // Find the selected variable to check isArray
  const selectedVariable = useMemo(
    () => allSenderVariables.find((v) => v.path === value),
    [allSenderVariables, value],
  );

  const hasGroupedOptions = Object.keys(groupedVariables).length > 0;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className={`w-full px-4 py-2.5 pr-9 rounded-2xl border text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer ${
            !value
              ? 'border-red-200 dark:border-red-500/30 bg-red-50/30 dark:bg-red-500/5'
              : 'border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900'
          } text-gray-900 dark:text-white ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <option value="">— Select Recipient Path —</option>
          <option value="admin">🛡️ System Administrator (admin)</option>

          {/* Grouped by model name */}
          {hasGroupedOptions &&
            Object.entries(groupedVariables).map(([model, vars]) => (
              <optgroup key={model} label={`${getModelIcon(model)} ${model}`}>
                {vars.map((v) => (
                  <option key={v.id} value={v.path}>
                    {formatPathBreadcrumb(v.path)} {v.isArray ? '(Array — Fan-Out)' : ''}
                  </option>
                ))}
              </optgroup>
            ))}

          {/* Fallback: flat list if no grouped options */}
          {!hasGroupedOptions &&
            filteredVariables.map((v) => (
              <option key={v.id} value={v.path}>
                {formatPathBreadcrumb(v.path)} {v.isArray ? '(Array)' : ''}
              </option>
            ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {/* Dynamic Array Warning */}
      {selectedVariable?.isArray && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl animate-fade-in">
          <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
            <span className="font-bold">Dynamic Fan-Out:</span> This target path contains a list
            array. A separate communication dispatch will be initialized and sent to every recipient
            in this dataset individually.
          </p>
        </div>
      )}

      {/* Display current value in breadcrumb format */}
      {value && value !== 'admin' && (
        <p className="text-[10px] text-gray-450 dark:text-navy-400 font-mono px-1">
          Path: <span className="text-brand-600 dark:text-brand-400">{value}</span>
        </p>
      )}
    </div>
  );
};
