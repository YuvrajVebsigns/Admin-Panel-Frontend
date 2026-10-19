'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { MessageTemplatesTab } from '@/modules/communications/components/MessageTemplatesTab';
import { EventMappingsTab } from '@/modules/communications/components/EventMappingsTab';
import { CommunicationChannel } from '@/modules/communications/types/communication.types';
import { Mail, MessageSquare, ToggleLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function TemplatesPage() {
  return (
    <Suspense fallback={<p className="py-12 text-sm text-navy-500">Loading templates…</p>}>
      <TemplatesContent />
    </Suspense>
  );
}

function TemplatesContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get('tab') === 'events' ? 'events' : 'email',
  );
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  // Build static tabs so they are always accessible
  const tabs = useMemo(() => {
    return [
      {
        id: 'email',
        label: 'Email Templates',
        icon: <Mail size={16} />,
        channel: CommunicationChannel.EMAIL,
      },
      {
        id: 'sms',
        label: 'SMS Templates',
        icon: <MessageSquare size={16} />,
        channel: CommunicationChannel.SMS,
      },
      {
        id: 'events',
        label: 'Event Mappings',
        icon: <ToggleLeft size={16} />,
      },
    ];
  }, []);

  const selectedTabObj = tabs.find((t) => t.id === activeTab);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      {!isWorkspaceOpen && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Configure notification layout content and map automated system events to active
            templates.
          </p>
        </div>
      )}

      {/* Tab Controls */}
      <div
        className={
          isWorkspaceOpen
            ? 'min-w-0'
            : 'bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 shadow-sm overflow-hidden'
        }
      >
        {!isWorkspaceOpen && (
          <div className="flex items-center border-b border-gray-100 dark:border-navy-800 px-4 sm:px-6">
            <div className="flex items-center flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'text-brand-600 dark:text-brand-400 border-brand-500'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-navy-600'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className={isWorkspaceOpen ? 'min-w-0' : 'p-4 sm:p-6'}>
          {activeTab === 'events' ? (
            <EventMappingsTab onWorkspaceChange={setIsWorkspaceOpen} />
          ) : (
            <MessageTemplatesTab
              channel={selectedTabObj?.channel}
              onWorkspaceChange={setIsWorkspaceOpen}
            />
          )}
        </div>
      </div>
    </div>
  );
}
