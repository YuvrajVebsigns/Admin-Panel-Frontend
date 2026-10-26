'use client';

import React, { useState, useMemo } from 'react';
import { formsService } from '@/services/forms.service';
import {
  FormQuestion,
  SubmissionStatus,
  BulkImportSubmissionsPayload,
  BulkImportResult,
  FormFieldType,
} from '../types/form.types';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Phone,
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface SubmissionsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  formId: string;
  formName?: string;
  formSlug?: string;
  questions?: FormQuestion[];
}

interface ParsedSubmissionRow {
  rowNumber: number;
  submitterEmail?: string;
  submitterPhone?: string;
  status: SubmissionStatus;
  answers: Record<string, unknown>;
  answersPreview: string;
  errors: string[];
  isValid: boolean;
}

export const SubmissionsImportModal: React.FC<SubmissionsImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  formId,
  formName = 'Custom Form',
  questions = [],
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedSubmissionRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      await formsService.downloadSubmissionsTemplate(formId);
      toast.success('Form submissions template downloaded successfully!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  const processExcelFile = async (file: File) => {
    setIsParsing(true);
    setUploadedFile(file);
    setImportResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Look for "Submissions" sheet, or first sheet
      const sheetName =
        workbook.SheetNames.find((s) => s.toLowerCase() === 'submissions') ||
        workbook.SheetNames.find((s) => s.toLowerCase() !== 'instructions') ||
        workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error('No valid worksheet found in the uploaded workbook.');
      }

      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new Error('The submissions worksheet is empty or missing.');
      }

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: '',
        raw: false,
      });

      if (!rawRows.length) {
        throw new Error('The worksheet contains no data rows to import.');
      }

      // Helper to resolve question from column header
      const resolveQuestion = (colHeader: string): FormQuestion | undefined => {
        const cleanHeader = colHeader.trim();
        const lowerHeader = cleanHeader.toLowerCase();

        // 1. Bracket pattern extraction: matches "[question_xxx]" anywhere in the header
        const bracketMatch = cleanHeader.match(/\[([^\]]+)\]/);
        if (bracketMatch && bracketMatch[1]) {
          const bracketContent = bracketMatch[1].trim().toLowerCase();
          const matched = questions.find((q) => q.key.toLowerCase() === bracketContent);
          if (matched) return matched;
        }

        // 2. Direct match with question key
        const directKeyMatch = questions.find((q) => q.key.toLowerCase() === lowerHeader);
        if (directKeyMatch) return directKeyMatch;

        // 3. Match combinations of label and key
        for (const q of questions) {
          const qKeyLower = q.key.toLowerCase();
          const qLabelLower = (q.label || '').toLowerCase().trim();

          if (
            lowerHeader === `${qLabelLower}, [${qKeyLower}]` ||
            lowerHeader === `${qLabelLower} [${qKeyLower}]` ||
            lowerHeader === `[${qKeyLower}] ${qLabelLower}` ||
            lowerHeader === `[${qKeyLower}], ${qLabelLower}` ||
            lowerHeader === `[${qKeyLower}]`
          ) {
            return q;
          }
        }

        // 4. Fallback match by label
        return questions.find((q) => (q.label || '').toLowerCase().trim() === lowerHeader);
      };

      const parsed: ParsedSubmissionRow[] = rawRows.map((rawRow, idx) => {
        const rowNumber = idx + 2;
        let submitterEmail = String(
          rawRow['Submitter Email'] || rawRow['submitterEmail'] || rawRow['Email'] || '',
        ).trim();
        let submitterPhone = String(
          rawRow['Submitter Phone'] || rawRow['submitterPhone'] || rawRow['Phone'] || '',
        ).trim();

        const rawStatus = String(rawRow['Status'] || rawRow['status'] || '')
          .trim()
          .toUpperCase();
        const status = Object.values(SubmissionStatus).includes(rawStatus as SubmissionStatus)
          ? (rawStatus as SubmissionStatus)
          : SubmissionStatus.NEW;

        const answers: Record<string, unknown> = {};
        const errors: string[] = [];

        // Match row keys to form questions
        Object.entries(rawRow).forEach(([colHeader, cellValue]) => {
          const cleanHeader = colHeader.toLowerCase().trim();
          if (
            cleanHeader === 'submitter email' ||
            cleanHeader === 'submitter phone' ||
            cleanHeader === 'status'
          ) {
            return;
          }

          const matchedQuestion = resolveQuestion(colHeader);
          if (matchedQuestion) {
            let val: unknown = cellValue;
            if (
              matchedQuestion.type === FormFieldType.MULTIPLE_CHOICE &&
              typeof cellValue === 'string'
            ) {
              val = cellValue
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            }
            answers[matchedQuestion.key] = val;

            if (matchedQuestion.type === FormFieldType.EMAIL && !submitterEmail && cellValue) {
              submitterEmail = String(cellValue).trim();
            }
            if (matchedQuestion.type === FormFieldType.PHONE && !submitterPhone && cellValue) {
              submitterPhone = String(cellValue).trim();
            }
          }
        });

        // Validate required questions
        questions.forEach((q) => {
          if (q.validation?.required) {
            const val = answers[q.key];
            const isMissing =
              val === undefined ||
              val === null ||
              (typeof val === 'string' && val.trim() === '') ||
              (Array.isArray(val) && val.length === 0);

            if (isMissing) {
              errors.push(`${q.label} is required`);
            }
          }
        });

        // Format answers preview text
        const previewParts = Object.entries(answers)
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`);

        return {
          rowNumber,
          submitterEmail: submitterEmail || undefined,
          submitterPhone: submitterPhone || undefined,
          status,
          answers,
          answersPreview: previewParts.join(' | ') || 'No question answers found',
          errors,
          isValid: errors.length === 0,
        };
      });

      setParsedRows(parsed);
      toast.success(`Successfully parsed ${parsed.length} submission rows!`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to parse Excel file');
      setParsedRows([]);
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

  const validRows = useMemo(() => parsedRows.filter((r) => r.isValid), [parsedRows]);

  const handleSubmitImport = async () => {
    if (!validRows.length) {
      toast.error('No valid response rows to import');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: BulkImportSubmissionsPayload = {
        rows: validRows.map((r) => ({
          submitterEmail: r.submitterEmail,
          submitterPhone: r.submitterPhone,
          status: r.status,
          answers: r.answers,
        })),
      };

      const result = await formsService.bulkImportSubmissions(formId, payload);
      setImportResult(result);

      if (result.createdCount > 0) {
        toast.success(`Successfully imported ${result.createdCount} responses!`);
        if (onSuccess) onSuccess();
      } else {
        toast.error('Failed to import responses. Please inspect error details.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to submit responses');
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
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-2xl">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Import Responses for {formName}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Bulk upload responses from an Excel file mapped to this form's questions (
                {questions.length} fields).
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
          {/* Action Header / Template Download */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
                Form Questions Template
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Download a custom Excel spreadsheet pre-populated with exact headers for each of
                this form's {questions.length} questions.
              </span>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              {isDownloading ? (
                <Loader2 size={16} className="animate-spin text-indigo-600" />
              ) : (
                <Download size={16} className="text-indigo-600" />
              )}
              <span>Download Form Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
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
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  {isParsing ? (
                    <Loader2 size={26} className="animate-spin" />
                  ) : (
                    <Upload size={26} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {uploadedFile
                      ? uploadedFile.name
                      : 'Click to upload or drag & drop responses Excel file'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Headers format: Question Label, [question_key] (e.g. First Name,
                    [question_1792588776234])
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Box if imported */}
          {importResult && (
            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Responses Import Finished
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Successfully imported {importResult.createdCount} out of{' '}
                    {importResult.totalProcessed} response rows.
                  </p>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-indigo-100 dark:border-indigo-800">
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertTriangle size={14} /> Validation Failures ({importResult.errors.length}):
                  </span>
                  <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                    {importResult.errors.map((e, idx) => (
                      <li key={idx}>
                        <strong>
                          Row #{e.row || idx + 1}
                          {e.email ? ` (${e.email})` : ''}:
                        </strong>{' '}
                        {e.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {!importResult && parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Parsed Responses Preview ({parsedRows.length})
                  </span>
                  <Badge
                    variant="light"
                    color={validRows.length > 0 ? 'success' : 'error'}
                    size="sm"
                  >
                    {validRows.length} Valid
                  </Badge>
                  {parsedRows.length - validRows.length > 0 && (
                    <Badge variant="light" color="error" size="sm">
                      {parsedRows.length - validRows.length} Errors
                    </Badge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setParsedRows([]);
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
                      <th className="p-3">Row</th>
                      <th className="p-3">Submitter Email / Phone</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Answers Preview</th>
                      <th className="p-3">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={
                          row.isValid
                            ? 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                            : 'bg-red-50/30 dark:bg-red-950/20'
                        }
                      >
                        <td className="p-3 font-medium text-gray-500">{row.rowNumber}</td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {row.submitterEmail || (
                              <span className="text-gray-400 italic">None</span>
                            )}
                          </div>
                          {row.submitterPhone && (
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone size={10} /> {row.submitterPhone}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant="light" color="dark" size="sm">
                            {row.status}
                          </Badge>
                        </td>
                        <td
                          className="p-3 text-gray-600 dark:text-gray-400 max-w-sm truncate"
                          title={row.answersPreview}
                        >
                          {row.answersPreview}
                        </td>
                        <td className="p-3">
                          {row.isValid ? (
                            <Badge variant="light" color="success" size="sm">
                              Valid
                            </Badge>
                          ) : (
                            <span
                              className="text-red-600 font-semibold"
                              title={row.errors.join(', ')}
                            >
                              {row.errors[0]}
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
              disabled={isSubmitting || validRows.length === 0}
              onClick={handleSubmitImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Importing Responses...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Import {validRows.length} Valid Responses</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
