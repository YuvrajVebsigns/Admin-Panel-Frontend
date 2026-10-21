'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { useEvents } from '@/modules/events/hooks/useEvents';
import { registreeService } from '@/services/registree.service';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Calendar,
  Globe,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ListOrdered,
  FileUp,
  Trash2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface RegistrationBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ParsedBulkRow {
  rowNumber: number;
  websiteName?: string;
  websiteId?: string;
  eventTitle?: string;
  eventId?: string;
  fullName: string;
  workEmail: string;
  personalEmail?: string;
  countryCode?: string;
  phoneNumber?: string;
  landlineNumber?: string;
  organization: string;
  jobTitle: string;
  industryVertical?: string;
  city?: string;
  state?: string;
  country?: string;
  registrationType?: string;
  status?: string;
  sponsorConsent?: string | boolean;
  message?: string;
  errors: string[];
  isValid: boolean;
}

interface UploadSummaryResult {
  totalProcessed: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: Array<{ row: number; email?: string; error: string }>;
}

const PRESET_ROW_COUNTS = [10, 25, 50, 100, 250, 500];

export const RegistrationBulkUploadModal: React.FC<RegistrationBulkUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'upload'>('download');

  // Step 1: Download Template State
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [activeRows, setActiveRows] = useState<number>(10);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Step 2: Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedRows, setParsedRows] = useState<ParsedBulkRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<UploadSummaryResult | null>(null);

  // Fetch websites and events
  const { websites = [], isLoading: isLoadingWebsites } = useWebsites({ limit: 100 });
  const { events = [], isLoading: isLoadingEvents } = useEvents();

  // Filter Live & Upcoming events specifically associated with the selected website
  const liveAndUpcomingEvents = useMemo(() => {
    if (!selectedWebsiteId) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return events.filter((e) => {
      const websiteMatches =
        Array.isArray(e.websites) &&
        e.websites.some((w) => {
          if (!w) return false;
          if (typeof w === 'string') return w === selectedWebsiteId;
          const wObj = w as { id?: string; _id?: string };
          return wObj.id === selectedWebsiteId || wObj._id === selectedWebsiteId;
        });

      if (!websiteMatches) return false;

      const isDraft = e.status === 'DRAFT';
      const isCompleted = e.status === 'COMPLETED';
      const isCancelled = e.status === 'CANCELLED';
      if (isDraft || isCompleted || isCancelled) return false;

      if (e.endDate) {
        const end = new Date(e.endDate);
        if (end < now) return false;
      }

      return true;
    });
  }, [events, selectedWebsiteId]);

  const selectedWebsite = useMemo(() => {
    return websites.find((w) => w.id === selectedWebsiteId);
  }, [websites, selectedWebsiteId]);

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId);
  }, [events, selectedEventId]);

  const handleWebsiteChange = (websiteId: string) => {
    setSelectedWebsiteId(websiteId);
    setSelectedEventId('');
  };

  // Reset upload state
  const resetUploadState = () => {
    setUploadedFile(null);
    setParsedRows([]);
    setUploadResult(null);
  };

  // Handle template download
  const handleDownloadTemplate = async () => {
    if (!selectedWebsiteId) {
      toast.error('Please select a website');
      return;
    }
    if (!selectedEventId) {
      toast.error('Please select a live or upcoming event');
      return;
    }
    if (!activeRows || activeRows < 1) {
      toast.error('Please specify at least 1 active row');
      return;
    }

    try {
      setIsDownloading(true);
      await registreeService.downloadBulkTemplate({
        websiteId: selectedWebsiteId,
        eventId: selectedEventId,
        rows: activeRows,
      });

      toast.success(
        `Excel template with ${activeRows} pre-filled rows generated and downloaded successfully!`,
      );
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to generate bulk upload template');
    } finally {
      setIsDownloading(false);
    }
  };

  // Parse Excel file and strictly validate client-side
  const processExcelFile = useCallback(
    async (file: File) => {
      setIsParsing(true);
      setUploadedFile(file);
      setUploadResult(null);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Prefer "Registration_Data" sheet, otherwise first sheet
        const sheetName =
          workbook.SheetNames.find((s) => s.toLowerCase() === 'registration_data') ||
          workbook.SheetNames[0];

        if (!sheetName) {
          throw new Error('No worksheets found in the uploaded workbook.');
        }

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          throw new Error('Worksheet data is empty or missing.');
        }

        const rawJsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: '',
          raw: false,
        });

        if (!rawJsonRows.length) {
          throw new Error('The uploaded sheet is empty or contains no data rows.');
        }

        const emailOccurrences = new Map<string, number[]>();
        const processedRows: ParsedBulkRow[] = [];

        rawJsonRows.forEach((rawRow, idx) => {
          const rowNum = idx + 2; // Row 1 is header

          // Helper to get case-insensitive and wildcard property matches
          const getVal = (keys: string[]): string => {
            for (const k of keys) {
              const exactKey = Object.keys(rawRow).find(
                (rk) => rk.trim().toLowerCase() === k.trim().toLowerCase(),
              );
              if (exactKey && rawRow[exactKey] !== undefined && rawRow[exactKey] !== null) {
                return String(rawRow[exactKey]).trim();
              }
            }
            return '';
          };

          const websiteName = getVal(['Website Name', 'websiteName', 'website']);
          const eventTitle = getVal(['Event Title', 'eventTitle', 'event', 'event name']);
          const fullName = getVal(['Full Name *', 'Full Name', 'fullName', 'name']);
          const workEmail = getVal([
            'Work Email *',
            'Work Email',
            'workEmail',
            'email',
            'Official Email',
          ])
            .replace(/\\+/g, '')
            .trim()
            .toLowerCase();
          const personalEmail = getVal(['Personal Email', 'personalEmail'])
            .replace(/\\+/g, '')
            .trim()
            .toLowerCase();
          const countryCode = getVal(['Country Code', 'countryCode']) || '+91';
          const phoneNumber = getVal([
            'Phone / Mobile Number',
            'phoneNumber',
            'mobileNumber',
            'mobile',
            'phone',
          ]);
          const landlineNumber = getVal(['Landline Number', 'landlineNumber', 'landline']);
          const organization = getVal([
            'Organization / Company *',
            'Organization / Company',
            'organization',
            'company',
            'companyName',
          ]);
          const jobTitle = getVal([
            'Job Title / Designation *',
            'Job Title / Designation',
            'jobTitle',
            'designation',
            'title',
          ]);
          const industryVertical = getVal([
            'Industry Vertical',
            'industryVertical',
            'industry',
            'vertical',
          ]);
          const city = getVal(['City', 'city']);
          const state = getVal(['State', 'state']);
          const country = getVal(['Country', 'country']);
          const registrationType = getVal(['Registration Type', 'registrationType']) || 'Delegate';
          const status =
            getVal([
              'Status of Registree',
              'Registration Status',
              'Status',
              'status',
            ]).toUpperCase() || 'PENDING';
          const sponsorConsent = getVal(['Sponsor Consent', 'sponsorConsent']) || 'No';
          const message = getVal(['Message / Notes', 'Message', 'message', 'notes']);

          // Skip completely empty placeholder rows
          if (!fullName && !workEmail && !organization && !jobTitle) {
            return;
          }

          const errors: string[] = [];

          // 1. Validate Full Name
          if (!fullName) {
            errors.push('Full Name is required');
          }

          // 2. Validate Work Email
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!workEmail) {
            errors.push('Work Email is required');
          } else if (!emailRegex.test(workEmail)) {
            errors.push(`Invalid email format: "${workEmail}"`);
          } else {
            // Check for intra-file duplicate emails
            const prevRows = emailOccurrences.get(workEmail) || [];
            if (prevRows.length > 0) {
              errors.push(`Duplicate email in file (already on Row ${prevRows.join(', ')})`);
            }
            emailOccurrences.set(workEmail, [...prevRows, rowNum]);
          }

          // 3. Validate Organization
          if (!organization) {
            errors.push('Organization / Company is required');
          }

          // 4. Validate Job Title
          if (!jobTitle) {
            errors.push('Job Title / Designation is required');
          }

          // 5. Validate Event Title / Selection
          if (!eventTitle && !selectedEventId) {
            errors.push('Event Title is missing and no default event selected');
          }

          processedRows.push({
            rowNumber: rowNum,
            websiteName: websiteName || selectedWebsite?.name,
            websiteId: selectedWebsiteId || undefined,
            eventTitle: eventTitle || selectedEvent?.title,
            eventId: selectedEventId || undefined,
            fullName,
            workEmail,
            personalEmail: personalEmail || undefined,
            countryCode,
            phoneNumber,
            landlineNumber: landlineNumber || undefined,
            organization,
            jobTitle,
            industryVertical,
            city,
            state,
            country,
            registrationType,
            status,
            sponsorConsent,
            message,
            errors,
            isValid: errors.length === 0,
          });
        });

        if (processedRows.length === 0) {
          throw new Error(
            'No valid data rows detected. Please make sure data is filled in the "Registration_Data" sheet.',
          );
        }

        setParsedRows(processedRows);

        const totalErrors = processedRows.reduce((acc, r) => acc + r.errors.length, 0);
        if (totalErrors === 0) {
          toast.success(
            `Validated ${processedRows.length} registration row(s) successfully with 0 errors!`,
          );
        } else {
          toast.error(
            `Found ${totalErrors} validation error(s) across ${
              processedRows.filter((r) => !r.isValid).length
            } row(s). Please fix before uploading.`,
          );
        }
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || 'Failed to parse Excel sheet.');
        setUploadedFile(null);
        setParsedRows([]);
      } finally {
        setIsParsing(false);
      }
    },
    [selectedWebsite, selectedWebsiteId, selectedEvent, selectedEventId],
  );

  // Handle File Input Change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  // Handle Drag and Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Submit confirmed batch to backend API
  const handleConfirmUpload = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    const invalidRows = parsedRows.filter((r) => !r.isValid);

    if (invalidRows.length > 0) {
      toast.error('Cannot upload while there are validation errors. Please fix the sheet.');
      return;
    }

    if (!validRows.length) {
      toast.error('No valid registration rows to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        rows: validRows.map((r) => ({
          websiteName: r.websiteName,
          websiteId: r.websiteId,
          eventTitle: r.eventTitle,
          eventId: r.eventId,
          fullName: r.fullName,
          workEmail: r.workEmail,
          personalEmail: r.personalEmail,
          countryCode: r.countryCode,
          phoneNumber: r.phoneNumber,
          landlineNumber: r.landlineNumber,
          organization: r.organization,
          jobTitle: r.jobTitle,
          industryVertical: r.industryVertical,
          city: r.city,
          state: r.state,
          country: r.country,
          registrationType: r.registrationType,
          status: r.status || 'PENDING',
          sponsorConsent: r.sponsorConsent,
          message: r.message,
        })),
        defaultWebsiteId: selectedWebsiteId || undefined,
        defaultEventId: selectedEventId || undefined,
      };

      const result = await registreeService.processBulkUpload(payload);
      setUploadResult(result);

      toast.success(
        `Successfully imported ${result.createdCount} new and updated ${result.updatedCount} existing attendee(s)!`,
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to process bulk upload on backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalRowsCount = parsedRows.length;
  const validRowsCount = parsedRows.filter((r) => r.isValid).length;
  const invalidRowsCount = parsedRows.filter((r) => !r.isValid).length;
  const allErrorsList = parsedRows.flatMap((r) =>
    r.errors.map((err) => ({ row: r.rowNumber, email: r.workEmail, error: err })),
  );

  const isFormValid =
    Boolean(selectedWebsiteId) && Boolean(selectedEventId) && activeRows >= 1 && activeRows <= 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 p-6 sm:p-8 shadow-2xl transition-all max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-navy-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 shrink-0">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Bulk Registration Manager
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Download pre-configured Excel templates with interactive dropdowns or upload filled
              sheets with client-side error verification.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-navy-800 mb-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'download'
                ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Download size={15} />
            <span>1. Download Excel Template</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Upload size={15} />
            <span>2. Upload & Validate Filled Sheet</span>
            {parsedRows.length > 0 && (
              <span
                className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  invalidRowsCount === 0
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-red-500/10 text-red-600'
                }`}
              >
                {parsedRows.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Download Template */}
        {activeTab === 'download' && (
          <div className="space-y-5 overflow-y-auto pr-1">
            {/* Field 1: Website Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Globe size={14} className="text-brand-500" />
                <span>Select Website</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedWebsiteId}
                  onChange={(e) => handleWebsiteChange(e.target.value)}
                  disabled={isLoadingWebsites || isDownloading}
                  className="w-full appearance-none rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50/70 dark:bg-navy-950/70 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-brand-500 focus:bg-white dark:focus:bg-navy-900 disabled:opacity-60 cursor-pointer"
                >
                  <option value="">
                    {isLoadingWebsites ? 'Loading websites...' : '-- Select Website --'}
                  </option>
                  {websites.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} {w.domain ? `(${w.domain})` : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <Layers size={16} />
                </div>
              </div>
            </div>

            {/* Field 2: Event Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-brand-500" />
                <span>Select Live / Upcoming Event</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  disabled={!selectedWebsiteId || isLoadingEvents || isDownloading}
                  className="w-full appearance-none rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50/70 dark:bg-navy-950/70 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-brand-500 focus:bg-white dark:focus:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <option value="">
                    {!selectedWebsiteId
                      ? '-- Select website above first --'
                      : liveAndUpcomingEvents.length === 0
                        ? '-- No live/upcoming events found for this website --'
                        : '-- Select Target Event --'}
                  </option>
                  {liveAndUpcomingEvents.map((e) => {
                    const startDateStr = e.startDate
                      ? new Date(e.startDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Upcoming';
                    const statusLabel = e.status === 'ON_GOING' ? 'LIVE NOW' : 'UPCOMING';
                    return (
                      <option key={e.id} value={e.id}>
                        {e.title} [{statusLabel} • {startDateStr}]
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <Calendar size={16} />
                </div>
              </div>
            </div>

            {/* Field 3: Numbers of Active Rows in Sheet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <ListOrdered size={14} className="text-brand-500" />
                  <span>Number of Active Rows in Template</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400">1 – 1,000 rows</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={activeRows || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setActiveRows(isNaN(val) ? 0 : Math.max(1, Math.min(1000, val)));
                  }}
                  disabled={isDownloading}
                  placeholder="e.g. 10"
                  className="w-28 rounded-xl border border-gray-200 dark:border-navy-700 bg-gray-50/70 dark:bg-navy-950/70 px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none transition-all focus:border-brand-500 focus:bg-white dark:focus:bg-navy-900"
                />

                <div className="flex flex-wrap items-center gap-1.5">
                  {PRESET_ROW_COUNTS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setActiveRows(cnt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeRows === cnt
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-navy-700'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Features Info Card */}
            <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 dark:bg-brand-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Template Dropdown & Formatting Features</span>
              </div>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>
                  <strong>Event Title Dropdown:</strong> Select any active event for this website
                  directly in Excel.
                </li>
                <li>
                  <strong>Industry Vertical Dropdown:</strong> Full curated list of 24 industry
                  categories from the registration system.
                </li>
                <li>
                  <strong>Standard Dropdowns:</strong> Country Code (+91, +1, +44, etc.),
                  Registration Type (Delegate, Sponsor, Speaker, VIP, Partner), Sponsor Consent.
                </li>
              </ul>
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1 cursor-pointer"
              >
                <span>Already have a filled template? Proceed to Upload</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={!isFormValid || isDownloading}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                  isFormValid && !isDownloading
                    ? 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/25 shadow-theme-xs hover:scale-[1.02]'
                    : 'bg-gray-300 dark:bg-navy-700 text-gray-500 cursor-not-allowed opacity-60'
                }`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Download Template (.xlsx)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Upload & Validate Filled Sheet */}
        {activeTab === 'upload' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 flex flex-col">
            {/* Upload Result Success Summary */}
            {uploadResult ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 p-6 space-y-4 text-center">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Bulk Import Completed Successfully!
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    All valid records have been parsed, resolved, and registered in the system.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs">
                  <div className="bg-white dark:bg-navy-800 p-3 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      Processed
                    </span>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                      {uploadResult.totalProcessed}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-navy-800 p-3 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-600 uppercase font-semibold">
                      New Created
                    </span>
                    <p className="text-lg font-extrabold text-emerald-600">
                      {uploadResult.createdCount}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-navy-800 p-3 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] text-blue-600 uppercase font-semibold">
                      Updated Profiles
                    </span>
                    <p className="text-lg font-extrabold text-blue-600">
                      {uploadResult.updatedCount}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetUploadState}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Upload Another Sheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-theme-xs cursor-pointer"
                  >
                    Done & View Registrations
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* File Dropzone */}
                {!uploadedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 dark:border-navy-700 hover:border-brand-500 rounded-3xl p-8 text-center transition-all bg-gray-50/50 dark:bg-navy-950/50 hover:bg-brand-500/5 cursor-pointer flex flex-col items-center justify-center space-y-3"
                    onClick={() => document.getElementById('bulk-excel-input')?.click()}
                  >
                    <input
                      id="bulk-excel-input"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                      <FileUp size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">
                        Click to browse or drag & drop your filled Excel sheet here
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supported file formats: .xlsx, .xls, .csv (Up to 1,000 rows)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 shrink-0">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • {totalRowsCount} rows parsed
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={resetUploadState}
                      disabled={isSubmitting}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                {/* Parsing Spinner */}
                {isParsing && (
                  <div className="flex items-center justify-center gap-2 p-6 text-xs text-gray-500">
                    <Loader2 size={18} className="animate-spin text-brand-500" />
                    <span>Parsing and checking sheet for errors...</span>
                  </div>
                )}

                {/* Validation Status Summary */}
                {parsedRows.length > 0 && (
                  <div className="space-y-3">
                    {invalidRowsCount > 0 ? (
                      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 dark:bg-red-500/10 p-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                          <AlertTriangle size={16} />
                          <span>
                            Validation Failed: {invalidRowsCount} row(s) contain errors (
                            {allErrorsList.length} total error(s))
                          </span>
                        </div>
                        <p className="text-[11px] text-red-600/80 dark:text-red-400/80">
                          Please fix the errors listed below in your Excel sheet before uploading.
                          The upload is locked until all errors are resolved.
                        </p>

                        {/* Error List */}
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                          {allErrorsList.map((errItem, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 bg-white/80 dark:bg-navy-900/80 p-2 rounded-xl text-xs border border-red-200 dark:border-red-900/40"
                            >
                              <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 font-bold text-[10px] shrink-0">
                                Row {errItem.row}
                              </span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {errItem.email && (
                                  <strong className="mr-1">{errItem.email}:</strong>
                                )}
                                {errItem.error}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 p-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 shrink-0">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            ✓ Validation Passed: All {validRowsCount} records are ready to import!
                          </p>
                          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                            No syntax errors, missing mandatory fields, or duplicate emails found.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Interactive Table Preview of Parsed Rows */}
                    <div className="rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden">
                      <div className="bg-gray-100 dark:bg-navy-800 px-4 py-2.5 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          Parsed Data Preview ({parsedRows.length} Rows)
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {validRowsCount} Valid • {invalidRowsCount} Invalid
                        </span>
                      </div>
                      <div className="max-h-48 overflow-y-auto overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-gray-50 dark:bg-navy-950 border-b border-gray-200 dark:border-navy-700 text-gray-500 font-semibold sticky top-0">
                            <tr>
                              <th className="px-3 py-2">Row</th>
                              <th className="px-3 py-2">Valid</th>
                              <th className="px-3 py-2">Reg. Status</th>
                              <th className="px-3 py-2">Full Name</th>
                              <th className="px-3 py-2">Work Email</th>
                              <th className="px-3 py-2">Organization</th>
                              <th className="px-3 py-2">Job Title</th>
                              <th className="px-3 py-2">Event Title</th>
                              <th className="px-3 py-2">Industry</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                            {parsedRows.map((r, i) => (
                              <tr
                                key={i}
                                className={
                                  r.isValid
                                    ? 'hover:bg-gray-50/50 dark:hover:bg-navy-800/50'
                                    : 'bg-red-50/60 dark:bg-red-950/30'
                                }
                              >
                                <td className="px-3 py-2 font-mono text-gray-400">
                                  #{r.rowNumber}
                                </td>
                                <td className="px-3 py-2">
                                  {r.isValid ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                      VALID
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                                      title={r.errors.join(', ')}
                                    >
                                      ERROR
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      r.status === 'APPROVED'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : r.status === 'REJECTED'
                                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                          : r.status === 'BLOCKED'
                                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                    }`}
                                  >
                                    {r.status || 'PENDING'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                                  {r.fullName || <span className="text-red-400">Missing</span>}
                                </td>
                                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                                  {r.workEmail || <span className="text-red-400">Missing</span>}
                                </td>
                                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                                  {r.organization || <span className="text-red-400">Missing</span>}
                                </td>
                                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                                  {r.jobTitle || <span className="text-red-400">Missing</span>}
                                </td>
                                <td className="px-3 py-2 text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                  {r.eventTitle || 'Default Event'}
                                </td>
                                <td className="px-3 py-2 text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                                  {r.industryVertical || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-navy-800 mt-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('download')}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                  >
                    ← Back to Template Download
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmUpload}
                      disabled={
                        !parsedRows.length || invalidRowsCount > 0 || isSubmitting || isParsing
                      }
                      className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-theme-xs cursor-pointer ${
                        parsedRows.length > 0 && invalidRowsCount === 0 && !isSubmitting
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25 hover:scale-[1.02]'
                          : 'bg-gray-300 dark:bg-navy-700 text-gray-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Importing Registrations...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Confirm & Import ({validRowsCount} Rows)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
