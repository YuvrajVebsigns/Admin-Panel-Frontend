'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { FormQuestion, FormFieldType, FormSettings } from '../types/form.types';

interface FormPreviewProps {
  formTitle: string;
  formDescription?: string;
  settings?: FormSettings;
  questions: FormQuestion[];
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  formTitle,
  formDescription,
  settings,
  questions,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden max-w-2xl mx-auto">
      {/* Top Banner Accent */}
      <div className="h-3 bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500" />

      {/* Header Info */}
      <div className="p-8 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {formTitle || 'Untitled Form'}
        </h2>
        {formDescription ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {formDescription}
          </p>
        ) : (
          <p className="mt-2 text-xs italic text-gray-400">No form description provided.</p>
        )}
        <div className="mt-4 flex items-center gap-2 text-xs text-red-500 font-medium">
          * Indicates required question
        </div>
      </div>

      {/* Questions Preview */}
      <div className="p-8 space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm font-medium">No questions added yet.</p>
            <p className="text-xs mt-1">Add questions from the builder tab to preview them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {questions.map((q, idx) => {
              const isHalf = q.width === 'half';
              return (
                <div
                  key={q.key || idx}
                  className={`space-y-2 ${isHalf ? 'col-span-1' : 'col-span-1 md:col-span-2'}`}
                >
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {q.label || `Question #${idx + 1}`}
                    {q.validation?.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {q.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{q.description}</p>
                  )}

                  {/* Render based on field type */}
                  {q.type === FormFieldType.SINGLE_INPUT && (
                    <input
                      type="text"
                      disabled
                      placeholder={q.placeholder || 'Your answer'}
                      className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
                    />
                  )}

                  {q.type === FormFieldType.PARAGRAPH && (
                    <textarea
                      disabled
                      rows={3}
                      placeholder={q.placeholder || 'Your long answer'}
                      className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3.5 py-2.5 text-gray-500 cursor-not-allowed resize-none"
                    />
                  )}

                  {q.type === FormFieldType.EMAIL && (
                    <input
                      type="email"
                      disabled
                      placeholder={q.placeholder || 'name@example.com'}
                      className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
                    />
                  )}

                  {q.type === FormFieldType.PHONE && (
                    <div>
                      <input
                        type="tel"
                        disabled
                        placeholder={q.placeholder || 'e.g. +971 50 123 4567'}
                        className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
                      />
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        Requires 8 to 12 digits
                      </span>
                    </div>
                  )}

                  {q.type === FormFieldType.NUMBER && (
                    <input
                      type="number"
                      disabled
                      placeholder={q.placeholder || '0'}
                      className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
                    />
                  )}

                  {q.type === FormFieldType.DATE && (
                    <div className="flex items-center justify-between w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3.5 py-2.5 text-gray-500 cursor-not-allowed">
                      <div className="flex items-center gap-2.5">
                        <Calendar size={16} className="text-brand-500" />
                        <span>{q.placeholder || 'Select date...'}</span>
                      </div>
                    </div>
                  )}

                  {q.type === FormFieldType.SINGLE_SELECT && (
                    <select
                      disabled
                      className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
                    >
                      <option value="">Choose an option</option>
                      {(q.options || []).map((opt, optIdx) => (
                        <option key={optIdx} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {q.type === FormFieldType.RADIO && (
                    <div className="space-y-2 pt-1">
                      {(q.options || []).map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-not-allowed"
                        >
                          <input
                            type="radio"
                            name={`preview_${q.key}`}
                            disabled
                            className="w-4 h-4 text-brand-600 border-gray-300"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === FormFieldType.MULTIPLE_CHOICE && (
                    <div className="space-y-2 pt-1">
                      {(q.options || []).map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-not-allowed"
                        >
                          <input
                            type="checkbox"
                            disabled
                            className="w-4 h-4 rounded text-brand-600 border-gray-300"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Button preview */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            type="button"
            disabled
            className="px-6 py-2.5 bg-brand-600 text-white font-semibold text-sm rounded-xl shadow-md cursor-not-allowed opacity-90"
          >
            {settings?.submitButtonText || 'Submit'}
          </button>
          {settings?.captchaEnabled !== false && (
            <span className="text-[11px] text-gray-400">Protected by Cloudflare Turnstile</span>
          )}
        </div>
      </div>
    </div>
  );
};
