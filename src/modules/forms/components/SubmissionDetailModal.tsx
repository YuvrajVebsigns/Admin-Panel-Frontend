'use client';

import React, { useState } from 'react';
import { FormSubmission, SubmissionStatus, FormFieldType } from '../types/form.types';
import { X, Calendar, Mail, Phone, Save } from 'lucide-react';

interface SubmissionDetailModalProps {
  submission: FormSubmission | null;
  onClose: () => void;
  onUpdateStatus: (status: SubmissionStatus, notes?: string) => Promise<void>;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  onClose,
  onUpdateStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus>(
    submission?.status || SubmissionStatus.NEW,
  );
  const [notes, setNotes] = useState(submission?.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (submission) {
      setSelectedStatus(submission.status);
      setNotes(submission.adminNotes || '');
    }
  }, [submission]);

  if (!submission) return null;

  const handleSaveStatus = async () => {
    setIsSaving(true);
    try {
      await onUpdateStatus(selectedStatus, notes);
    } finally {
      setIsSaving(false);
    }
  };

  const renderAnswerValue = (fieldType: FormFieldType, val: unknown) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-gray-400 italic">No answer provided</span>;
    }

    if (Array.isArray(val)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {val.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    if (fieldType === FormFieldType.PARAGRAPH) {
      return (
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
          {String(val)}
        </p>
      );
    }

    if (fieldType === FormFieldType.EMAIL) {
      return (
        <a
          href={`mailto:${String(val)}`}
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
        >
          <Mail size={14} />
          {String(val)}
        </a>
      );
    }

    if (fieldType === FormFieldType.PHONE) {
      return (
        <a
          href={`tel:${String(val)}`}
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
        >
          <Phone size={14} />
          {String(val)}
        </a>
      );
    }

    return (
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{String(val)}</span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Submission Response Details
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
              <Calendar size={13} />
              Submitted on{' '}
              {new Date(submission.createdAt).toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Scrollable Question & Answers */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Answers List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Submitted Questions & Answers
            </h4>
            <div className="space-y-3">
              {(submission.answers || []).map((ans, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      #{idx + 1} {ans.questionLabel}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-gray-400 px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {ans.fieldType}
                    </span>
                  </div>
                  <div>{renderAnswerValue(ans.fieldType, ans.value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Submitter Metadata */}
          {submission.submitter && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/60 space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Submitter Client Telemetry
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {submission.submitter.ipAddress && (
                  <div>
                    <span className="text-gray-400 block">IP Address:</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      {submission.submitter.ipAddress}
                    </span>
                  </div>
                )}
                {submission.submitter.countryCode && (
                  <div>
                    <span className="text-gray-400 block">Country:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {submission.submitter.countryCode}
                    </span>
                  </div>
                )}
                {submission.submitter.userAgent && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block">Browser User-Agent:</span>
                    <span className="font-mono text-[11px] text-gray-500 break-all">
                      {submission.submitter.userAgent}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status & Review Notes Section */}
          <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/20 space-y-3">
            <h4 className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
              Submission Management
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Review Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as SubmissionStatus)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value={SubmissionStatus.NEW}>New / Unreviewed</option>
                  <option value={SubmissionStatus.REVIEWED}>Reviewed / Accepted</option>
                  <option value={SubmissionStatus.SPAM}>Flagged as Spam</option>
                  <option value={SubmissionStatus.ARCHIVED}>Archived</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Internal Staff Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes visible only to team..."
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveStatus}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Save size={14} />
            <span>{isSaving ? 'Updating...' : 'Save Status & Notes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
