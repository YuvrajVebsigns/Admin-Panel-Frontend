'use client';

import React, { useState } from 'react';
import { FormQuestion, FormFieldType, FormFieldOption } from '../types/form.types';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Plus,
  SlidersHorizontal,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  List,
  CheckSquare,
  Radio,
  Calendar,
  Type,
} from 'lucide-react';

interface FormQuestionCardProps {
  question: FormQuestion;
  index: number;
  total: number;
  onChange: (updated: FormQuestion) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const FIELD_TYPE_OPTIONS = [
  { value: FormFieldType.SINGLE_INPUT, label: 'Single Line Text', icon: Type },
  { value: FormFieldType.PARAGRAPH, label: 'Paragraph / Multi-line', icon: AlignLeft },
  { value: FormFieldType.EMAIL, label: 'Email Address', icon: Mail },
  { value: FormFieldType.PHONE, label: 'Phone Number (8-12 digits)', icon: Phone },
  { value: FormFieldType.NUMBER, label: 'Number', icon: Hash },
  { value: FormFieldType.SINGLE_SELECT, label: 'Dropdown Select', icon: List },
  { value: FormFieldType.RADIO, label: 'Radio (Single Choice)', icon: Radio },
  {
    value: FormFieldType.MULTIPLE_CHOICE,
    label: 'Checkboxes (Multiple Choice)',
    icon: CheckSquare,
  },
  { value: FormFieldType.DATE, label: 'Date Picker', icon: Calendar },
];

export const FormQuestionCard: React.FC<FormQuestionCardProps> = ({
  question,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isChoiceField =
    question.type === FormFieldType.SINGLE_SELECT ||
    question.type === FormFieldType.RADIO ||
    question.type === FormFieldType.MULTIPLE_CHOICE;

  const handleTypeChange = (newType: FormFieldType) => {
    const updated = { ...question, type: newType };
    if (
      (newType === FormFieldType.SINGLE_SELECT ||
        newType === FormFieldType.RADIO ||
        newType === FormFieldType.MULTIPLE_CHOICE) &&
      (!updated.options || updated.options.length === 0)
    ) {
      updated.options = [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
      ];
    }
    onChange(updated);
  };

  const handleOptionChange = (optIdx: number, key: 'label' | 'value', val: string) => {
    const currentOptions = [...(question.options || [])];
    if (currentOptions[optIdx]) {
      currentOptions[optIdx] = {
        ...currentOptions[optIdx],
        [key]: val,
      };
      // Auto-update value if user changes label and value was auto-derived
      if (key === 'label' && !currentOptions[optIdx].value) {
        currentOptions[optIdx].value = val.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      }
      onChange({ ...question, options: currentOptions });
    }
  };

  const handleAddOption = () => {
    const currentOptions = question.options || [];
    const nextIdx = currentOptions.length + 1;
    onChange({
      ...question,
      options: [...currentOptions, { label: `Option ${nextIdx}`, value: `option_${nextIdx}` }],
    });
  };

  const handleRemoveOption = (optIdx: number) => {
    const currentOptions = [...(question.options || [])];
    currentOptions.splice(optIdx, 1);
    onChange({ ...question, options: currentOptions });
  };

  const handleValidationChange = (key: string, val: unknown) => {
    onChange({
      ...question,
      validation: {
        ...(question.validation || {}),
        [key]: val,
      },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 transition-all hover:border-brand-300 dark:hover:border-brand-600/50">
      {/* Question Header: Number, Move buttons, Actions */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs">
            #{index + 1}
          </span>
          <span className="text-xs font-mono text-gray-400">key: {question.key}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move Up"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move Down"
          >
            <ChevronDown size={16} />
          </button>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 rounded-lg text-gray-400 hover:text-brand-600 transition-colors"
            title="Duplicate Question"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
            title="Delete Question"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Question Settings: Label & Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Label */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Question Label / Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={question.label}
            onChange={(e) => onChange({ ...question, label: e.target.value })}
            placeholder="e.g., What is your full legal name?"
            className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Field Type Selector */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Input / Question Type
          </label>
          <select
            value={question.type}
            onChange={(e) => handleTypeChange(e.target.value as FormFieldType)}
            className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {FIELD_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description / Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Helper Description / Subtitle (Optional)
          </label>
          <input
            type="text"
            value={question.description || ''}
            onChange={(e) => onChange({ ...question, description: e.target.value })}
            placeholder="e.g., Please enter as shown on your passport"
            className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {!isChoiceField && question.type !== FormFieldType.DATE && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Placeholder Text (Optional)
            </label>
            <input
              type="text"
              value={question.placeholder || ''}
              onChange={(e) => onChange({ ...question, placeholder: e.target.value })}
              placeholder="e.g., e.g., Jane Doe"
              className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}
      </div>

      {/* Options for Choice Fields (single_select, radio, multiple_choice) */}
      {isChoiceField && (
        <div className="p-4 mb-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              Answer Choices / Options
            </h5>
            <button
              type="button"
              onClick={handleAddOption}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
            >
              <Plus size={14} />
              Add Option
            </button>
          </div>

          <div className="space-y-2">
            {(question.options || []).map((opt: FormFieldOption, optIdx: number) => (
              <div key={optIdx} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5 text-right font-mono">
                  {optIdx + 1}.
                </span>
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleOptionChange(optIdx, 'label', e.target.value)}
                  placeholder="Option Display Label"
                  className="flex-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  value={opt.value}
                  onChange={(e) => handleOptionChange(optIdx, 'value', e.target.value)}
                  placeholder="Stored value (key)"
                  className="w-36 text-xs font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  disabled={(question.options || []).length <= 1}
                  onClick={() => handleRemoveOption(optIdx)}
                  className="p-1 rounded text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Controls: Required Toggle, Width, Advanced Settings Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center gap-5">
          {/* Required Switch */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={question.validation?.required ?? false}
              onChange={(e) => handleValidationChange('required', e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 border-gray-300 dark:border-gray-600 focus:ring-brand-500"
            />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Required</span>
          </label>

          {/* Width Selector */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span>Width:</span>
            <button
              type="button"
              onClick={() => onChange({ ...question, width: 'full' })}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                (question.width || 'full') === 'full'
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...question, width: 'half' })}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                question.width === 'half'
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              50%
            </button>
          </div>
        </div>

        {/* Toggle Advanced Validation Rules */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
        >
          <SlidersHorizontal size={13} />
          <span>{showAdvanced ? 'Hide Validation Rules' : 'Advanced Rules'}</span>
        </button>
      </div>

      {/* Advanced Validation Drawer */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(question.type === FormFieldType.SINGLE_INPUT ||
              question.type === FormFieldType.PARAGRAPH) && (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Min Length (chars)</label>
                  <input
                    type="number"
                    min={0}
                    value={question.validation?.minLength ?? ''}
                    onChange={(e) =>
                      handleValidationChange(
                        'minLength',
                        e.target.value ? parseInt(e.target.value, 10) : undefined,
                      )
                    }
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Max Length (chars)</label>
                  <input
                    type="number"
                    min={0}
                    value={question.validation?.maxLength ?? ''}
                    onChange={(e) =>
                      handleValidationChange(
                        'maxLength',
                        e.target.value ? parseInt(e.target.value, 10) : undefined,
                      )
                    }
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Regex Pattern</label>
                  <input
                    type="text"
                    value={question.validation?.pattern || ''}
                    onChange={(e) => handleValidationChange('pattern', e.target.value || undefined)}
                    placeholder="e.g. ^[A-Z0-9]+$"
                    className="w-full text-xs font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {question.type === FormFieldType.NUMBER && (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Min Value</label>
                  <input
                    type="number"
                    value={question.validation?.min ?? ''}
                    onChange={(e) =>
                      handleValidationChange(
                        'min',
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Max Value</label>
                  <input
                    type="number"
                    value={question.validation?.max ?? ''}
                    onChange={(e) =>
                      handleValidationChange(
                        'max',
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-gray-500">Custom Error Message</label>
              <input
                type="text"
                value={question.validation?.customErrorMessage || ''}
                onChange={(e) =>
                  handleValidationChange('customErrorMessage', e.target.value || undefined)
                }
                placeholder="e.g., Please provide a valid business registration number"
                className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
