'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormQuestion, FormFieldType, FormStatus, FormSettings } from '../types/form.types';
import { FormQuestionCard } from './FormQuestionCard';
import { FormPreview } from './FormPreview';
import { useCustomForm } from '../hooks/useCustomForms';
import { Plus, Save, ArrowLeft, Eye, Settings, Layers, Inbox, Globe } from 'lucide-react';
import DateTimePicker from '@/components/form/date-picker';
import toast from 'react-hot-toast';

interface FormBuilderProps {
  formId: string;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ formId }) => {
  const router = useRouter();
  const { form, isLoading, updateForm, updateQuestions, isUpdating, isSavingQuestions } =
    useCustomForm(formId);

  const [activeTab, setActiveTab] = useState<'builder' | 'settings' | 'preview'>('builder');

  // Local state initialized when form loads
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    status: FormStatus;
    settings: FormSettings;
  } | null>(null);

  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state once form is fetched
  React.useEffect(() => {
    if (form && !formData) {
      setFormData({
        name: form.name,
        slug: form.slug,
        description: form.description || '',
        status: form.status,
        settings: {
          submitButtonText: form.settings?.submitButtonText || 'Submit',
          successMessage:
            form.settings?.successMessage || 'Thank you! Your response has been submitted.',
          redirectUrl: form.settings?.redirectUrl || '',
          notificationEmails: form.settings?.notificationEmails || [],
          captchaEnabled: form.settings?.captchaEnabled ?? true,
          maxSubmissions: form.settings?.maxSubmissions,
          startDate: form.settings?.startDate ? form.settings.startDate.slice(0, 10) : '',
          endDate: form.settings?.endDate ? form.settings.endDate.slice(0, 10) : '',
        },
      });
      setQuestions((form.questions || []).sort((a, b) => (a.order || 0) - (b.order || 0)));
    }
  }, [form, formData]);

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  const handleAddQuestion = () => {
    const nextOrder = questions.length + 1;
    const newQ: FormQuestion = {
      key: `question_${Date.now()}`,
      label: `Question #${nextOrder}`,
      type: FormFieldType.SINGLE_INPUT,
      order: nextOrder,
      width: 'full',
      validation: { required: false },
    };
    setQuestions([...questions, newQ]);
    setHasChanges(true);
  };

  const handleUpdateQuestion = (idx: number, updated: FormQuestion) => {
    const copy = [...questions];
    copy[idx] = updated;
    setQuestions(copy);
    setHasChanges(true);
  };

  const handleMoveQuestion = (idx: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === questions.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const copy = [...questions];
    const moved = copy.splice(idx, 1)[0];
    if (moved) {
      copy.splice(targetIdx, 0, moved);
    }

    // Re-index order property
    const reordered = copy.map((q, i) => ({ ...q, order: i + 1 }));
    setQuestions(reordered);
    setHasChanges(true);
  };

  const handleDuplicateQuestion = (idx: number) => {
    const source = questions[idx];
    if (!source) return;
    const duplicated: FormQuestion = {
      ...source,
      key: `question_${Date.now()}`,
      label: `${source.label} (Copy)`,
      type: source.type,
      order: idx + 2,
    };
    const copy = [...questions];
    copy.splice(idx + 1, 0, duplicated);
    const reordered = copy.map((q, i) => ({ ...q, order: i + 1 }));
    setQuestions(reordered);
    setHasChanges(true);
    toast.success('Question duplicated');
  };

  const handleDeleteQuestion = (idx: number) => {
    if (window.confirm('Delete this question?')) {
      const copy = [...questions];
      copy.splice(idx, 1);
      const reordered = copy.map((q, i) => ({ ...q, order: i + 1 }));
      setQuestions(reordered);
      setHasChanges(true);
      toast.success('Question removed');
    }
  };

  const handleSave = async () => {
    try {
      // 1. Save Form Settings & Info
      const sanitizedSettings = {
        ...formData.settings,
        startDate: formData.settings.startDate?.trim() || undefined,
        endDate: formData.settings.endDate?.trim() || undefined,
      };

      await updateForm({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        status: formData.status,
        settings: sanitizedSettings,
      });

      // 2. Save Questions Array
      await updateQuestions(questions);

      setHasChanges(false);
      toast.success('All changes saved successfully');
    } catch {
      // Error handled by hook toast
    }
  };

  const website = typeof form?.websiteId === 'object' ? form.websiteId : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/forms')}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Back to Forms"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {formData.name || 'Untitled Form'}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  formData.status === FormStatus.PUBLISHED
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : formData.status === FormStatus.ARCHIVED
                      ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                }`}
              >
                {formData.status}
              </span>
            </h1>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="font-mono">/{formData.slug}</span>
              {website && (
                <span className="flex items-center gap-1">
                  <Globe size={12} />
                  {website.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/forms/${formId}/submissions`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Inbox size={14} />
            <span>Responses ({form?.submissionCount || 0})</span>
          </Link>
          <button
            type="button"
            disabled={isUpdating || isSavingQuestions}
            onClick={handleSave}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
              hasChanges
                ? 'bg-brand-600 hover:bg-brand-700 animate-pulse'
                : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            <Save size={16} />
            <span>{isUpdating || isSavingQuestions ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Builder Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'builder'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Layers size={16} />
          <span>Questions & Fields ({questions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Settings size={16} />
          <span>Form Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'preview'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Eye size={16} />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Tab 1: Questions & Fields */}
      {activeTab === 'builder' && (
        <div className="space-y-4">
          {/* Form Basic Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Form Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Form Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setHasChanges(true);
                  }}
                  className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Form Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => {
                    setFormData({ ...formData, status: e.target.value as FormStatus });
                    setHasChanges(true);
                  }}
                  className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value={FormStatus.DRAFT}>Draft</option>
                  <option value={FormStatus.PUBLISHED}>Published</option>
                  <option value={FormStatus.ARCHIVED}>Archived</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Form Slug (URL identifier) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-xl text-gray-500 font-mono">
                    /forms/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
                      });
                      setHasChanges(true);
                    }}
                    className="w-full text-sm rounded-r-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Form Description / Introduction
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setHasChanges(true);
                  }}
                  placeholder="Provide instructions or context for visitors filling out this form..."
                  className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, idx) => (
              <FormQuestionCard
                key={question.key || idx}
                question={question}
                index={idx}
                total={questions.length}
                onChange={(updated) => handleUpdateQuestion(idx, updated)}
                onMoveUp={() => handleMoveQuestion(idx, 'up')}
                onMoveDown={() => handleMoveQuestion(idx, 'down')}
                onDuplicate={() => handleDuplicateQuestion(idx)}
                onDelete={() => handleDeleteQuestion(idx)}
              />
            ))}
          </div>

          {/* Add Question Button */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 bg-gray-50/50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Plus size={20} />
            <span>Add New Question Field</span>
          </button>
        </div>
      )}

      {/* Tab 2: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Form Submission & Notification Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Submit Button Text */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Submit Button Label
              </label>
              <input
                type="text"
                value={formData.settings.submitButtonText || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, submitButtonText: e.target.value },
                  });
                  setHasChanges(true);
                }}
                placeholder="e.g. Submit Application, Register Now"
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Success Message */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Success Confirmation Message
              </label>
              <input
                type="text"
                value={formData.settings.successMessage || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, successMessage: e.target.value },
                  });
                  setHasChanges(true);
                }}
                placeholder="e.g. Thank you for your submission!"
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Redirect URL */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Redirect URL after submission (Optional)
              </label>
              <input
                type="url"
                value={formData.settings.redirectUrl || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, redirectUrl: e.target.value },
                  });
                  setHasChanges(true);
                }}
                placeholder="e.g. https://cio-choice.com/thank-you"
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Notification Emails */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Staff Notification Emails (Comma separated)
              </label>
              <input
                type="text"
                value={(formData.settings.notificationEmails || []).join(', ')}
                onChange={(e) => {
                  const emails = e.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean);
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, notificationEmails: emails },
                  });
                  setHasChanges(true);
                }}
                placeholder="admin@vebsigns.com, alerts@cio-choice.com"
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Schedule Dates */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Opening Date (Optional)
              </label>
              <DateTimePicker
                id="form-start-date"
                value={formData.settings.startDate || ''}
                onChange={(dateVal) => {
                  const str = Array.isArray(dateVal)
                    ? dateVal[0]?.toISOString().split('T')[0] || ''
                    : typeof dateVal === 'string'
                      ? dateVal
                      : '';
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, startDate: str },
                  });
                  setHasChanges(true);
                }}
                placeholder="Select opening date"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Closing Date (Optional)
              </label>
              <DateTimePicker
                id="form-end-date"
                value={formData.settings.endDate || ''}
                onChange={(dateVal) => {
                  const str = Array.isArray(dateVal)
                    ? dateVal[0]?.toISOString().split('T')[0] || ''
                    : typeof dateVal === 'string'
                      ? dateVal
                      : '';
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, endDate: str },
                  });
                  setHasChanges(true);
                }}
                placeholder="Select closing date"
              />
            </div>

            {/* Max Submissions Cap */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Max Submissions Limit (Optional)
              </label>
              <input
                type="number"
                min={1}
                value={formData.settings.maxSubmissions ?? ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      maxSubmissions: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    },
                  });
                  setHasChanges(true);
                }}
                placeholder="e.g. 100"
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* CAPTCHA Toggle */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="captchaToggle"
                checked={formData.settings.captchaEnabled ?? true}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, captchaEnabled: e.target.checked },
                  });
                  setHasChanges(true);
                }}
                className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-500"
              />
              <label
                htmlFor="captchaToggle"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Enable Cloudflare Turnstile anti-spam verification
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Live Preview */}
      {activeTab === 'preview' && (
        <div className="py-4">
          <FormPreview
            formTitle={formData.name}
            formDescription={formData.description}
            settings={formData.settings}
            questions={questions}
          />
        </div>
      )}
    </div>
  );
};
