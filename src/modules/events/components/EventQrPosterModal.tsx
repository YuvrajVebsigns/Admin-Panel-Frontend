'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { EventManagement } from '../types/event.types';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { getImageUrl } from '@/lib/utils';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Calendar,
  MapPin,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Printer,
  Sliders,
  Eye,
  FileText,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EventQrPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventManagement;
}

export const EventQrPosterModal: React.FC<EventQrPosterModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const { websites = [] } = useWebsites({ limit: 100 });
  const posterRef = useRef<HTMLDivElement>(null);

  // Configuration state
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [registrationPath, setRegistrationPath] = useState<string>('/register');
  const [queryKey, setQueryKey] = useState<string>('offlineKey');
  const [queryValue, setQueryValue] = useState<string>('');
  const [includeEventId, setIncludeEventId] = useState<boolean>(true);
  const [includeMode, setIncludeMode] = useState<boolean>(true);
  const [posterTheme, setPosterTheme] = useState<'luxury-dark' | 'clean-light'>('luxury-dark');

  // Operational state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');
  const [imageError, setImageError] = useState<boolean>(false);

  // Generate a random offline token
  const generateNewToken = () => {
    const eventSuffix = event.id ? event.id.slice(-6).toUpperCase() : 'EVT';
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CAMPUS_${eventSuffix}_${randomSuffix}`;
  };

  // Initialize domain and token when modal opens or event changes
  useEffect(() => {
    if (!isOpen) return;

    setImageError(false);

    // Resolve initial domain from event websites, or websites list, or default
    let defaultDomain = 'cio-crown.com';

    if (event.websites && event.websites.length > 0) {
      const firstSite = event.websites[0];
      if (typeof firstSite === 'object' && firstSite !== null && 'domain' in firstSite) {
        defaultDomain = String((firstSite as { domain: string }).domain);
      } else if (typeof firstSite === 'string') {
        const found = websites.find(
          (w) => w.id === firstSite || (w as { _id?: string })._id === firstSite,
        );
        if (found?.domain) defaultDomain = found.domain;
      }
    } else if (websites.length > 0 && websites[0]?.domain) {
      defaultDomain = websites[0].domain;
    }

    setSelectedDomain(defaultDomain);
    setQueryValue(generateNewToken());
    setQueryKey('offlineKey');
    setRegistrationPath('/register');
  }, [isOpen, event, websites]);

  // Compute final registration URL
  const targetDomain = selectedDomain === 'custom' ? customDomain.trim() : selectedDomain.trim();
  const cleanDomain = (targetDomain || 'cio-crown.com')
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');

  const queryParams = new URLSearchParams();
  if (queryKey.trim() && queryValue.trim()) {
    queryParams.set(queryKey.trim(), queryValue.trim());
  }
  if (includeEventId && event.id) {
    queryParams.set('eventId', event.id);
  }
  if (includeMode) {
    queryParams.set('mode', 'offline');
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const cleanPath = registrationPath.startsWith('/') ? registrationPath : `/${registrationPath}`;
  const finalRegistrationUrl = `https://${cleanDomain}${cleanPath}${queryString}`;

  // Generate QR code data URL whenever final URL updates
  useEffect(() => {
    if (!finalRegistrationUrl) return;

    QRCode.toDataURL(finalRegistrationUrl, {
      margin: 1,
      width: 600,
      errorCorrectionLevel: 'H',
      color: {
        dark: posterTheme === 'luxury-dark' ? '#0f172a' : '#111827',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {
        setQrDataUrl('');
      });
  }, [finalRegistrationUrl, posterTheme]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(finalRegistrationUrl);
      setCopied(true);
      toast.success('Registration URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const handleDownloadQrOnly = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${event.slug || 'event'}-offline-qr.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success('QR Code image downloaded!');
  };

  const handleDownloadPosterPng = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    const toastId = toast.loading('Rendering high-resolution poster PNG...');

    try {
      // Small pause for rendering stability
      await new Promise((r) => setTimeout(r, 200));

      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: posterTheme === 'luxury-dark' ? '#0b0f19' : '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `${event.slug || 'event'}-offline-registration-poster.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      toast.success('Poster PNG downloaded successfully!', { id: toastId });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to render poster PNG', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPosterPdf = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    const toastId = toast.loading('Generating printable PDF poster...');

    try {
      await new Promise((r) => setTimeout(r, 200));

      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: posterTheme === 'luxury-dark' ? '#0b0f19' : '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      const posY = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;

      pdf.addImage(imgData, 'JPEG', 0, posY, pageWidth, Math.min(imgHeight, pageHeight));
      pdf.save(`${event.slug || 'event'}-offline-registration-poster.pdf`);

      toast.success('Printable PDF poster downloaded!', { id: toastId });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to generate PDF poster', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPoster = () => {
    if (!posterRef.current) return;
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      toast.error('Unable to open print preview. Please check pop-up blocker.');
      return;
    }

    const posterHtml = posterRef.current.outerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${event.title} - On-Campus Registration Poster</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { margin: 0; padding: 0; background: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .print-wrap { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 12px; }
          </style>
        </head>
        <body>
          <div class="print-wrap">
            ${posterHtml}
          </div>
          <script>
            setTimeout(() => {
              window.focus();
              window.print();
            }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Formatted date string
  const formattedDate = event.startDate
    ? new Date(event.startDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Upcoming Event';

  const bannerImageUrl = getImageUrl(event.bannerImage);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      className="max-w-[1120px] w-full overflow-hidden p-0"
    >
      <div className="flex flex-col h-[88vh] max-h-[850px] bg-white dark:bg-navy-900">
        {/* Modal Header: Fixed top bar with brand accent and safe spacing away from close button */}
        <div className="relative px-6 py-4 border-b border-gray-100 dark:border-navy-800 shrink-0 bg-white dark:bg-navy-900 pr-16">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 dark:text-brand-400 flex items-center justify-center shrink-0">
                <QrCode size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Event Registration QR Poster
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-500/20">
                    Offline Auto-Approval
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Generate and download an on-campus scan poster with custom query keys for instant
                  approval.
                </p>
              </div>
            </div>

            {/* Quick tab switcher for mobile/smaller screens */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex p-1 bg-gray-100 dark:bg-navy-950 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-navy-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Eye size={13} className="inline mr-1" />
                  Poster
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'settings'
                      ? 'bg-white dark:bg-navy-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Sliders size={13} className="inline mr-1" />
                  Options
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body: Scrollable dual-column workspace */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Configuration Controls (5 cols, ~42% width) */}
            <div
              className={`lg:col-span-5 space-y-4 ${
                activeTab === 'settings' ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* Domain & URL Config */}
              <div className="bg-gray-50/90 dark:bg-navy-950/50 p-4 rounded-2xl border border-gray-100 dark:border-navy-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  <Globe size={14} className="text-brand-500" />
                  <span>Target Website & Destination</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Website Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {websites.map((w) => (
                      <option key={w.id} value={w.domain}>
                        {w.name} ({w.domain})
                      </option>
                    ))}
                    <option value="cio-crown.com">cio-crown.com</option>
                    <option value="core-mediagroup.com">core-mediagroup.com</option>
                    <option value="custom">-- Custom Domain --</option>
                  </select>
                </div>

                {selectedDomain === 'custom' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Enter Domain
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. event.ciocrown.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Registration Path
                  </label>
                  <input
                    type="text"
                    placeholder="/register"
                    value={registrationPath}
                    onChange={(e) => setRegistrationPath(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* URL Query Key-Value Parameters (Core auto-approval mechanism) */}
              <div className="bg-brand-50/40 dark:bg-brand-500/5 p-4 rounded-2xl border border-brand-100 dark:border-brand-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    <Sparkles size={14} className="text-brand-500" />
                    <span>Custom URL Query Pair</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQueryValue(generateNewToken())}
                    className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 bg-white dark:bg-navy-900 px-2 py-1 rounded-lg border border-brand-200 dark:border-brand-500/30 shadow-xs hover:bg-brand-50/50 dark:hover:bg-brand-500/10 transition-colors"
                  >
                    <RefreshCw size={10} />
                    New Token
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Query Key
                    </label>
                    <input
                      type="text"
                      value={queryKey}
                      onChange={(e) => setQueryKey(e.target.value)}
                      placeholder="offlineKey"
                      className="w-full text-xs font-mono py-2 px-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Key Value (Pass Token)
                    </label>
                    <input
                      type="text"
                      value={queryValue}
                      onChange={(e) => setQueryValue(e.target.value)}
                      placeholder="CAMPUS_PASS_01"
                      className="w-full text-xs font-mono py-2 px-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white font-semibold truncate focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  When attendees scan this QR code, the frontend extracts{' '}
                  <code className="text-brand-600 dark:text-brand-400 font-bold">
                    {queryKey || 'offlineKey'}
                  </code>{' '}
                  and submits it with the registration payload for immediate auto-approval.
                </p>

                {/* Query Toggles */}
                <div className="pt-2 border-t border-brand-100 dark:border-brand-500/20 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={includeEventId}
                      onChange={(e) => setIncludeEventId(e.target.checked)}
                      className="rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>
                      Pre-select event
                      <code className="ml-1.5 px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 text-[10px] font-mono text-brand-700 dark:text-brand-300 font-bold border border-brand-200/50 dark:border-brand-500/20">
                        eventId={event.id ? event.id.slice(-6) : 'auto'}...
                      </code>
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={includeMode}
                      onChange={(e) => setIncludeMode(e.target.checked)}
                      className="rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>
                      Explicit offline flag
                      <code className="ml-1.5 px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 text-[10px] font-mono text-brand-700 dark:text-brand-300 font-bold border border-brand-200/50 dark:border-brand-500/20">
                        mode=offline
                      </code>
                    </span>
                  </label>
                </div>
              </div>

              {/* Generated Target URL with Copy button */}
              <div className="bg-white dark:bg-navy-900 p-3.5 rounded-2xl border border-gray-200 dark:border-navy-700 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <ExternalLink size={12} className="text-gray-400" />
                    Encoded QR Target URL:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-100 dark:border-navy-800">
                  <p className="text-[11px] font-mono text-gray-800 dark:text-gray-200 font-medium break-all select-all leading-relaxed">
                    {finalRegistrationUrl}
                  </p>
                </div>
              </div>

              {/* Poster Theme Selector */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-navy-950/60 border border-gray-100 dark:border-navy-800">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Poster Style:
                </span>
                <div className="flex gap-1.5 bg-gray-200/60 dark:bg-navy-900 p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPosterTheme('luxury-dark')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      posterTheme === 'luxury-dark'
                        ? 'bg-navy-950 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Executive Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterTheme('clean-light')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      posterTheme === 'clean-light'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Print Light
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Poster Stage Preview (7 cols, ~58% width) */}
            <div
              className={`lg:col-span-7 flex flex-col items-center ${
                activeTab === 'preview' ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* Stage Canvas Container */}
              <div className="w-full bg-gray-50/70 dark:bg-navy-950/60 rounded-2xl border border-gray-100 dark:border-navy-800/80 p-4 sm:p-5 flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400 px-1">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Eye size={13} className="text-brand-500" /> Live Poster Preview
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-200/50 dark:bg-navy-900">
                    {posterTheme === 'luxury-dark' ? 'Executive Dark' : 'Print Light'}
                  </span>
                </div>

                {/* The Printable / Renderable Poster Card */}
                <div
                  id="event-qr-poster-card"
                  ref={posterRef}
                  style={{ width: '400px', maxWidth: '100%' }}
                  className={`rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border ${
                    posterTheme === 'luxury-dark'
                      ? 'bg-gradient-to-b from-[#0d1322] via-[#0b0f19] to-[#070a12] text-white border-navy-700/60'
                      : 'bg-white text-gray-900 border-gray-200'
                  }`}
                >
                  {/* Event Banner Header with Error Handling (Prevents broken image icon & alt text clash) */}
                  {bannerImageUrl && !imageError ? (
                    <div className="relative h-36 w-full overflow-hidden bg-navy-950">
                      <img
                        src={bannerImageUrl}
                        alt=""
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                      <div
                        className={`absolute inset-0 ${
                          posterTheme === 'luxury-dark'
                            ? 'bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/40 to-black/30'
                            : 'bg-gradient-to-t from-white via-white/40 to-black/10'
                        }`}
                      />
                      <div className="absolute top-3 left-4 z-10">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          OFFLINE CAMPUS ACCESS
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Fallback Branded Graphic Banner */
                    <div
                      className={`relative h-24 w-full overflow-hidden p-4 flex flex-col justify-between ${
                        posterTheme === 'luxury-dark'
                          ? 'bg-gradient-to-br from-brand-950/60 via-navy-900 to-[#0b0f19]'
                          : 'bg-gradient-to-br from-brand-50 via-gray-50 to-white'
                      }`}
                    >
                      <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-30 bg-brand-500" />
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-brand-500 text-white shadow-md shadow-brand-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          OFFLINE CAMPUS ACCESS
                        </span>
                        <span
                          className={`text-[9px] font-bold tracking-wider uppercase ${
                            posterTheme === 'luxury-dark'
                              ? 'text-brand-300/90'
                              : 'text-brand-600/90'
                          }`}
                        >
                          OFFICIAL PASS
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Event Details Content */}
                  <div className="px-5 pt-3 pb-2 text-center space-y-1.5">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        posterTheme === 'luxury-dark' ? 'text-brand-400' : 'text-brand-600'
                      }`}
                    >
                      {event.type || 'In-Person'} Event Registration
                    </p>
                    <h1
                      className={`text-xl sm:text-2xl font-black tracking-tight leading-snug px-2 ${
                        posterTheme === 'luxury-dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {event.title}
                    </h1>
                  </div>

                  {/* Date & Location Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs px-5 pb-2">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-[11px] ${
                        posterTheme === 'luxury-dark'
                          ? 'bg-navy-800/80 border border-navy-700/60 text-gray-200'
                          : 'bg-gray-100 border border-gray-200 text-gray-700'
                      }`}
                    >
                      <Calendar size={12} className="text-brand-500 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>

                    {(event.location?.address || event.location?.city) && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-[11px] ${
                          posterTheme === 'luxury-dark'
                            ? 'bg-navy-800/80 border border-navy-700/60 text-gray-200'
                            : 'bg-gray-100 border border-gray-200 text-gray-700'
                        }`}
                      >
                        <MapPin size={12} className="text-brand-500 shrink-0" />
                        <span className="max-w-[180px] truncate">
                          {event.location?.address || event.location?.city}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* QR Code Hero Display Card */}
                  <div className="px-5 py-2">
                    <div
                      className={`p-4 rounded-2xl mx-auto max-w-[260px] shadow-lg border ${
                        posterTheme === 'luxury-dark'
                          ? 'bg-white text-gray-900 border-white/90'
                          : 'bg-white text-gray-900 border-gray-200'
                      }`}
                    >
                      {qrDataUrl ? (
                        <div className="aspect-square w-full flex items-center justify-center bg-white rounded-xl overflow-hidden p-1">
                          <img
                            src={qrDataUrl}
                            alt="Scan Registration QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square w-full flex items-center justify-center text-xs text-gray-400">
                          Generating QR...
                        </div>
                      )}

                      <div className="mt-2.5 text-center">
                        <span className="inline-block text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg bg-brand-500 text-white shadow-sm shadow-brand-500/30">
                          SCAN TO REGISTER
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2 Steps Instructions */}
                  <div className="px-5 pb-3">
                    <div
                      className={`p-3 rounded-2xl border text-left space-y-2 ${
                        posterTheme === 'luxury-dark'
                          ? 'bg-navy-900/60 border-navy-800/80 text-gray-300'
                          : 'bg-gray-50 border-gray-100 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                          1
                        </span>
                        <span>Scan with any smartphone camera or QR scanner.</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                          2
                        </span>
                        <span>Enter attendee details on the on-campus portal.</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Branding */}
                  <div className="px-5 pb-4 pt-1 text-center border-t border-gray-200/20">
                    <p
                      className={`text-[9px] font-semibold tracking-wider uppercase ${
                        posterTheme === 'luxury-dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {cleanDomain} &bull; Core Media Group
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer Toolbar: ALWAYS visible, regardless of scroll position */}
        <div className="shrink-0 border-t border-gray-100 dark:border-navy-800 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Ready for export &bull; High-res 300 DPI vector QR</span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              onClick={handleDownloadPosterPng}
              disabled={isExporting || !qrDataUrl}
              className="text-xs font-bold bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/25 transition-all"
            >
              <Download size={14} />
              <span>Poster (PNG)</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadPosterPdf}
              disabled={isExporting || !qrDataUrl}
              className="text-xs font-bold border-brand-200 dark:border-brand-500/30 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl transition-all"
            >
              <FileText size={14} />
              <span>Poster (PDF)</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadQrOnly}
              disabled={!qrDataUrl}
              className="text-xs font-semibold flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl"
            >
              <ImageIcon size={14} />
              <span>QR Only</span>
            </Button>

            <Button
              variant="outline"
              onClick={handlePrintPoster}
              disabled={isExporting || !qrDataUrl}
              className="text-xs font-semibold flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl"
            >
              <Printer size={14} />
              <span>Print</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
