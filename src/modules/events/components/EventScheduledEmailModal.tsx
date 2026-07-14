import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import { EventScheduledEmail, ScheduleType, EventManagement } from '../types/event.types';
import { useMessageTemplates } from '@/modules/communications/hooks/useMessageTemplates';

interface EventScheduledEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventManagement;
  onSave: (emails: EventScheduledEmail[]) => void;
}

export const EventScheduledEmailModal: React.FC<EventScheduledEmailModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
}) => {
  const [emails, setEmails] = useState<EventScheduledEmail[]>([]);
  const { templates, isLoading: _isTemplatesLoading } = useMessageTemplates();

  useEffect(() => {
    if (isOpen && event.scheduledEmails) {
      setEmails(event.scheduledEmails);
    } else if (isOpen) {
      setEmails([]);
    }
  }, [isOpen, event.scheduledEmails]);

  if (!isOpen) return null;

  const handleAddEmail = () => {
    setEmails([
      ...emails,
      {
        templateId: '',
        scheduleType: ScheduleType.BEFORE_EVENT,
        daysOffset: 1,
        isActive: true,
        isProcessed: false,
      },
    ]);
  };

  const handleRemoveEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, field: keyof EventScheduledEmail, value: unknown) => {
    const updated = [...emails];
    const newEmail = { ...updated[index] } as unknown as Record<string, unknown>;
    newEmail[field as string] = value;
    updated[index] = newEmail as unknown as EventScheduledEmail;
    setEmails(updated);
  };

  const handleSave = () => {
    // Validate
    const invalid = emails.some((e) => !e.templateId);
    if (invalid) {
      alert('Please select a template for all scheduled emails.');
      return;
    }
    onSave(emails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-navy-700 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-navy-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="text-brand-500" size={24} />
              Scheduled Event Reminders
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Configure automated emails sent to approved registrations before or after the event.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Active Schedules</h3>
            <Button variant="outline" size="sm" onClick={handleAddEmail}>
              + Add Schedule
            </Button>
          </div>

          {emails.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 dark:border-navy-700 rounded-2xl">
              <Clock className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-sm text-gray-500">No scheduled emails configured yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emails.map((email, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900/30"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Template
                      </label>
                      <select
                        value={
                          email.templateId && typeof email.templateId === 'object'
                            ? String((email.templateId as Record<string, unknown>).id || '')
                            : String(email.templateId || '')
                        }
                        onChange={(e) => handleEmailChange(idx, 'templateId', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900"
                      >
                        <option value="">Select Template</option>
                        {templates.map((tpl: { id: string; name: string }) => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Timing
                      </label>
                      <select
                        value={email.scheduleType}
                        onChange={(e) => handleEmailChange(idx, 'scheduleType', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900"
                      >
                        <option value={ScheduleType.BEFORE_EVENT}>Before Event</option>
                        <option value={ScheduleType.AFTER_EVENT}>After Event</option>
                        <option value={ScheduleType.EXACT_DATE}>Exact Date</option>
                      </select>
                    </div>

                    <div className="col-span-4">
                      {email.scheduleType === ScheduleType.EXACT_DATE ? (
                        <>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={
                              email.exactDate
                                ? new Date(email.exactDate).toISOString().slice(0, 16)
                                : ''
                            }
                            onChange={(e) => handleEmailChange(idx, 'exactDate', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900"
                          />
                        </>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label
                              className="block text-xs font-bold text-gray-500 uppercase mb-1 truncate"
                              title="Days"
                            >
                              Days
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={email.daysOffset || 0}
                              onChange={(e) =>
                                handleEmailChange(
                                  idx,
                                  'daysOffset',
                                  parseInt(e.target.value, 10) || 0,
                                )
                              }
                              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900"
                            />
                          </div>
                          <div>
                            <label
                              className="block text-xs font-bold text-gray-500 uppercase mb-1 truncate"
                              title="Hours"
                            >
                              Hrs
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="23"
                              value={email.hoursOffset || 0}
                              onChange={(e) =>
                                handleEmailChange(
                                  idx,
                                  'hoursOffset',
                                  parseInt(e.target.value, 10) || 0,
                                )
                              }
                              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900"
                            />
                          </div>
                          <div>
                            <label
                              className="block text-xs font-bold text-gray-500 uppercase mb-1 truncate"
                              title="Minutes"
                            >
                              Mins
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={email.minutesOffset || 0}
                              onChange={(e) =>
                                handleEmailChange(
                                  idx,
                                  'minutesOffset',
                                  parseInt(e.target.value, 10) || 0,
                                )
                              }
                              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 flex items-end justify-end">
                      <button
                        onClick={() => handleRemoveEmail(idx)}
                        className="p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-xl transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="text-blue-500 mt-0.5 shrink-0" size={16} />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Scheduled emails are processed by a background worker. "Before Event" offsets
              calculate backwards from the event start date. Templates should have base schema
              "Registree".
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-navy-800 flex justify-end gap-3 bg-gray-50 dark:bg-navy-900/50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Schedules
          </Button>
        </div>
      </div>
    </div>
  );
};
