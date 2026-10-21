'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCustomForm } from '@/modules/forms/hooks/useCustomForms';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { Website } from '@/modules/websites/types/website.types';
import { FormStatus, FormFieldType } from '@/modules/forms/types/form.types';
import { ArrowLeft, Sparkles, Globe } from 'lucide-react';
import Link from 'next/link';

export default function CreateFormPage() {
  const router = useRouter();
  const { createForm, isCreating } = useCreateCustomForm();
  const { websites, isLoading: loadingWebsites } = useWebsites({ limit: 100 });

  const [websiteId, setWebsiteId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<FormStatus>(FormStatus.DRAFT);

  // Auto-select first website if available
  React.useEffect(() => {
    if (websites.length > 0 && !websiteId && websites[0]?.id) {
      setWebsiteId(websites[0].id);
    }
  }, [websites, websiteId]);

  const handleNameChange = (val: string) => {
    setName(val);
    const derivedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
    setSlug(derivedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !websiteId) return;

    const initialQuestion = {
      key: 'full_name',
      label: 'Full Name',
      type: FormFieldType.SINGLE_INPUT,
      order: 1,
      width: 'full' as const,
      placeholder: 'e.g., John Doe',
      validation: { required: true },
    };

    const newForm = await createForm({
      websiteId,
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      status,
      questions: [initialQuestion],
      settings: {
        submitButtonText: 'Submit Response',
        successMessage: 'Thank you! Your response has been submitted.',
        captchaEnabled: true,
      },
    });

    if (newForm?.id) {
      router.push(`/forms/${newForm.id}/builder`);
    } else {
      router.push('/forms');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/forms"
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Custom Form
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Set up basic details. You can configure and design all questions in the visual builder
            next.
          </p>
        </div>
      </div>

      {/* Creation Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sm:p-8 space-y-6"
      >
        {/* Website Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={13} className="text-brand-500" />
            Website Tenancy <span className="text-red-500">*</span>
          </label>
          <select
            value={websiteId}
            onChange={(e) => setWebsiteId(e.target.value)}
            required
            className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {loadingWebsites ? (
              <option>Loading websites...</option>
            ) : (
              websites.map((w: Website) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.domain || 'no domain'})
                </option>
              ))
            )}
          </select>
          <p className="text-[11px] text-gray-400">Form slug will be unique to this website.</p>
        </div>

        {/* Form Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Form Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. CIO Choice 2026 Nominee Survey"
            className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            URL Slug <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="text-xs px-3.5 py-2.5 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-xl text-gray-500 font-mono">
              /forms/
            </span>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
              placeholder="cio-choice-2026-survey"
              className="w-full text-sm font-mono rounded-r-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <p className="text-[11px] text-gray-400">
            This forms the public link on the website (e.g. mea.cio-choice.com/forms/...)
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Description / Overview (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this form is for, instructions for participants, or deadlines..."
            className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Initial Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Initial Publishing Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                status === FormStatus.DRAFT
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={FormStatus.DRAFT}
                checked={status === FormStatus.DRAFT}
                onChange={() => setStatus(FormStatus.DRAFT)}
                className="sr-only"
              />
              <span className="text-xs block">Draft (Private)</span>
            </label>
            <label
              className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                status === FormStatus.PUBLISHED
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={FormStatus.PUBLISHED}
                checked={status === FormStatus.PUBLISHED}
                onChange={() => setStatus(FormStatus.PUBLISHED)}
                className="sr-only"
              />
              <span className="text-xs block">Published (Live)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
          <Link
            href="/forms"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>{isCreating ? 'Creating Form...' : 'Create & Open Visual Builder'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
