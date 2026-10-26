'use client';

import React, { useState, useMemo } from 'react';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { formsService } from '@/services/forms.service';
import {
  FormFieldType,
  FormStatus,
  BulkImportFormsPayload,
  BulkImportResult,
  FormQuestion,
} from '../types/form.types';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface FormsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialWebsiteId?: string;
}

interface ParsedFormItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: FormStatus;
  settings: {
    submitButtonText: string;
    successMessage: string;
    redirectUrl?: string;
    captchaEnabled: boolean;
    allowMultipleSubmissions: boolean;
    notificationEmails: string[];
  };
  questions: FormQuestion[];
  errors: string[];
  isValid: boolean;
}

export const FormsImportModal: React.FC<FormsImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialWebsiteId,
}) => {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>(initialWebsiteId || '');
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedForms, setParsedForms] = useState<ParsedFormItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  const { websites = [], isLoading: isLoadingWebsites } = useWebsites({ limit: 100 });

  // Preselect website if not already set
  React.useEffect(() => {
    if (!selectedWebsiteId && initialWebsiteId) {
      setSelectedWebsiteId(initialWebsiteId);
    } else if (!selectedWebsiteId && websites.length > 0 && websites[0]?.id) {
      setSelectedWebsiteId(websites[0].id);
    }
  }, [initialWebsiteId, websites, selectedWebsiteId]);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      await formsService.downloadFormsTemplate(selectedWebsiteId);
      toast.success('Excel forms import template downloaded successfully!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  const normalizeFieldType = (val: unknown): FormFieldType => {
    const s = String(val || '')
      .trim()
      .toLowerCase();
    switch (s) {
      case 'paragraph':
      case 'textarea':
        return FormFieldType.PARAGRAPH;
      case 'email':
        return FormFieldType.EMAIL;
      case 'phone':
      case 'mobile':
      case 'telephone':
        return FormFieldType.PHONE;
      case 'number':
      case 'numeric':
        return FormFieldType.NUMBER;
      case 'single_select':
      case 'select':
      case 'dropdown':
        return FormFieldType.SINGLE_SELECT;
      case 'radio':
        return FormFieldType.RADIO;
      case 'multiple_choice':
      case 'checkbox':
      case 'checkboxes':
        return FormFieldType.MULTIPLE_CHOICE;
      case 'date':
      case 'datepicker':
        return FormFieldType.DATE;
      case 'single_input':
      case 'text':
      default:
        return FormFieldType.SINGLE_INPUT;
    }
  };

  const processExcelFile = async (file: File) => {
    setIsParsing(true);
    setUploadedFile(file);
    setImportResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Look for "Forms" sheet, or fallback to first sheet
      const formsSheetName =
        workbook.SheetNames.find((s) => s.toLowerCase() === 'forms') ||
        workbook.SheetNames.find((s) => s.toLowerCase() !== 'instructions') ||
        workbook.SheetNames[0];

      if (!formsSheetName) {
        throw new Error('No valid worksheet found in the uploaded file.');
      }

      const formsWorksheet = workbook.Sheets[formsSheetName];
      if (!formsWorksheet) {
        throw new Error('The forms worksheet is empty or missing.');
      }

      const rawForms = XLSX.utils.sheet_to_json<Record<string, unknown>>(formsWorksheet, {
        defval: '',
        raw: false,
      });

      if (!rawForms.length) {
        throw new Error('The "Forms" sheet contains no data rows.');
      }

      // Check for "Questions" sheet
      const questionsSheetName = workbook.SheetNames.find((s) => s.toLowerCase() === 'questions');
      const questionsMap = new Map<string, FormQuestion[]>();

      if (questionsSheetName && workbook.Sheets[questionsSheetName]) {
        const rawQuestions = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          workbook.Sheets[questionsSheetName],
          { defval: '', raw: false },
        );

        rawQuestions.forEach((qRow, qIdx) => {
          const formSlugRef = String(
            qRow['Form Slug'] || qRow['form_slug'] || qRow['Form Name'] || '',
          )
            .trim()
            .toLowerCase();

          if (!formSlugRef) return;

          const rawOptions = String(qRow['Options'] || qRow['options'] || '').trim();
          const parsedOptions = rawOptions
            ? rawOptions
                .split(/[|,]/)
                .map((o) => o.trim())
                .filter(Boolean)
                .map((opt) => ({ label: opt, value: opt }))
            : [];

          const type = normalizeFieldType(qRow['Type'] || qRow['Field Type'] || qRow['type']);
          const isRequired = ['yes', 'true', '1', 'required'].includes(
            String(qRow['Required'] || qRow['required'] || '')
              .trim()
              .toLowerCase(),
          );

          const q: FormQuestion = {
            key: String(qRow['Key'] || qRow['key'] || `question_${qIdx + 1}`)
              .trim()
              .toLowerCase()
              .replace(/[\s-]+/g, '_'),
            label: String(qRow['Label'] || qRow['label'] || `Question #${qIdx + 1}`).trim(),
            description: String(qRow['Description'] || qRow['description'] || '').trim(),
            placeholder: String(qRow['Placeholder'] || qRow['placeholder'] || '').trim(),
            url: String(qRow['URL'] || qRow['url'] || '').trim(),
            type,
            options: parsedOptions,
            validation: {
              required: isRequired,
              minLength: qRow['Min Length'] ? Number(qRow['Min Length']) : undefined,
              maxLength: qRow['Max Length'] ? Number(qRow['Max Length']) : undefined,
            },
            order: qIdx + 1,
            width:
              String(qRow['Width'] || '')
                .trim()
                .toLowerCase() === 'half'
                ? 'half'
                : 'full',
          };

          if (!questionsMap.has(formSlugRef)) {
            questionsMap.set(formSlugRef, []);
          }
          questionsMap.get(formSlugRef)?.push(q);
        });
      }

      // Process forms rows
      const items: ParsedFormItem[] = rawForms.map((row, idx) => {
        const name = String(row['Form Name'] || row['name'] || '').trim();
        const slug = String(row['Slug'] || row['slug'] || '')
          .trim()
          .toLowerCase();
        const description = String(row['Description'] || row['description'] || '').trim();
        const rawStatus = String(row['Status'] || row['status'] || '')
          .trim()
          .toUpperCase();
        const status =
          rawStatus === 'PUBLISHED'
            ? FormStatus.PUBLISHED
            : rawStatus === 'ARCHIVED'
              ? FormStatus.ARCHIVED
              : FormStatus.DRAFT;

        const submitButtonText = String(
          row['Submit Button Text'] || row['submitButtonText'] || 'Submit',
        ).trim();
        const successMessage = String(
          row['Success Message'] ||
            row['successMessage'] ||
            'Thank you! Your response has been submitted.',
        ).trim();
        const redirectUrl = String(row['Redirect URL'] || row['redirectUrl'] || '').trim();
        const captchaEnabled = !['no', 'false', '0'].includes(
          String(row['CAPTCHA Enabled'] || row['captchaEnabled'] || 'yes')
            .trim()
            .toLowerCase(),
        );
        const allowMultipleSubmissions = !['no', 'false', '0'].includes(
          String(row['Allow Multiple Submissions'] || row['allowMultipleSubmissions'] || 'yes')
            .trim()
            .toLowerCase(),
        );
        const notificationEmails = String(
          row['Notification Emails'] || row['notificationEmails'] || '',
        )
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean);

        const errors: string[] = [];
        if (!name) {
          errors.push('Form Name is required');
        }

        // Match questions by slug or name
        const matchedQuestions =
          questionsMap.get(slug) ||
          questionsMap.get(name.toLowerCase()) ||
          questionsMap.get(slug.replace(/[\s_]+/g, '-')) ||
          [];

        return {
          id: `form_row_${idx + 1}`,
          name,
          slug,
          description,
          status,
          settings: {
            submitButtonText,
            successMessage,
            redirectUrl: redirectUrl || undefined,
            captchaEnabled,
            allowMultipleSubmissions,
            notificationEmails,
          },
          questions: matchedQuestions,
          errors,
          isValid: errors.length === 0,
        };
      });

      setParsedForms(items);
      toast.success(`Successfully parsed ${items.length} forms from workbook!`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to parse Excel file');
      setParsedForms([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const validForms = useMemo(() => parsedForms.filter((f) => f.isValid), [parsedForms]);

  const handleSubmitImport = async () => {
    if (!selectedWebsiteId) {
      toast.error('Please select a target website for import');
      return;
    }

    if (!validForms.length) {
      toast.error('No valid forms available to import');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: BulkImportFormsPayload = {
        websiteId: selectedWebsiteId,
        forms: validForms.map((f) => ({
          name: f.name,
          slug: f.slug || undefined,
          description: f.description,
          status: f.status,
          settings: f.settings,
          questions: f.questions,
        })),
      };

      const result = await formsService.bulkImportForms(payload);
      setImportResult(result);

      if (result.createdCount > 0) {
        toast.success(`Successfully imported ${result.createdCount} custom forms!`);
        if (onSuccess) onSuccess();
      } else {
        toast.error('Failed to import forms. Please check errors.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to submit bulk forms');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 rounded-2xl">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Bulk Import Custom Forms
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Import complete form configurations, settings, and questions from an Excel
                spreadsheet (.xlsx).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Target Website & Download Template Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Globe size={14} className="text-brand-500" />
                Target Website
              </label>
              <select
                value={selectedWebsiteId}
                onChange={(e) => setSelectedWebsiteId(e.target.value)}
                disabled={isLoadingWebsites || isSubmitting}
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.domain})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                {isDownloading ? (
                  <Loader2 size={16} className="animate-spin text-brand-600" />
                ) : (
                  <Download size={16} className="text-brand-600" />
                )}
                <span>Download Sample Template</span>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          {!importResult && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-8 text-center bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer relative"
            >
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600">
                  {isParsing ? (
                    <Loader2 size={26} className="animate-spin" />
                  ) : (
                    <Upload size={26} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {uploadedFile ? uploadedFile.name : 'Click to upload or drag & drop Excel file'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Supports Microsoft Excel spreadsheet files (.xlsx, .xls)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary Box if already imported */}
          {importResult && (
            <div className="p-5 rounded-2xl bg-brand-50/50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Import Process Completed
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Created {importResult.createdCount} of {importResult.totalProcessed} forms.
                  </p>
                </div>
              </div>

              {importResult.createdForms && importResult.createdForms.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Created Forms:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {importResult.createdForms.map((cf) => (
                      <span
                        key={cf.id}
                        className="px-2.5 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        {cf.name} (/{cf.slug})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-brand-100 dark:border-brand-800">
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertTriangle size={14} /> Failed Rows ({importResult.errors.length}):
                  </span>
                  <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
                    {importResult.errors.map((e, idx) => (
                      <li key={idx}>
                        <strong>{e.formName || 'Form'}:</strong> {e.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Parsed Forms Preview Table */}
          {!importResult && parsedForms.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Parsed Forms Preview ({parsedForms.length})
                  </span>
                  <Badge
                    variant="light"
                    color={validForms.length > 0 ? 'success' : 'error'}
                    size="sm"
                  >
                    {validForms.length} Valid
                  </Badge>
                  {parsedForms.length - validForms.length > 0 && (
                    <Badge variant="light" color="error" size="sm">
                      {parsedForms.length - validForms.length} Invalid
                    </Badge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setParsedForms([]);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 size={13} /> Clear
                </button>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 sticky top-0">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Form Name</th>
                      <th className="p-3">Slug</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Questions</th>
                      <th className="p-3">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {parsedForms.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={
                          item.isValid
                            ? 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                            : 'bg-red-50/30 dark:bg-red-950/20'
                        }
                      >
                        <td className="p-3 font-medium text-gray-500">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {item.name || <span className="text-red-500">Missing</span>}
                          </div>
                          {item.description && (
                            <div className="text-[11px] text-gray-500 truncate max-w-xs">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">
                          {item.slug || <span className="italic text-gray-400">Auto-slug</span>}
                        </td>
                        <td className="p-3">
                          <Badge variant="light" color="dark" size="sm">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {item.questions.length > 0 ? (
                            <span className="font-semibold text-brand-600">
                              {item.questions.length} questions
                            </span>
                          ) : (
                            <span className="text-gray-400">0 questions</span>
                          )}
                        </td>
                        <td className="p-3">
                          {item.isValid ? (
                            <Badge variant="light" color="success" size="sm">
                              Ready
                            </Badge>
                          ) : (
                            <span
                              className="text-red-600 font-semibold"
                              title={item.errors.join(', ')}
                            >
                              {item.errors[0]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {importResult ? 'Close' : 'Cancel'}
          </button>

          {!importResult && (
            <button
              type="button"
              disabled={isSubmitting || validForms.length === 0}
              onClick={handleSubmitImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Importing Forms...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Import {validForms.length} Valid Forms</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
