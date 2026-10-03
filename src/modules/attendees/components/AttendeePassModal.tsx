'use client';

import React, { useState, useEffect } from 'react';
import { Attendee } from '../types/attendee.types';
import {
  X,
  Calendar,
  MapPin,
  Building,
  ShieldCheck,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Globe,
} from 'lucide-react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

interface AttendeePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: Attendee | null;
  onPrint?: () => void;
}

export const AttendeePassModal: React.FC<AttendeePassModalProps> = ({
  isOpen,
  onClose,
  attendee,
  onPrint,
}) => {
  const [copiedPassCode, setCopiedPassCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');

  const event = attendee?.eventId;
  const eventTitle = typeof event === 'object' && event ? event.title : 'Event';
  const eventDate =
    typeof event === 'object' && event && event.startDate
      ? new Date(event.startDate).toLocaleDateString([], {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';
  const eventLocation =
    typeof event === 'object' && event ? event.location?.address || 'Online Venue' : 'Online Venue';

  // Compute dynamic agenda passcode URL: https://[website-domain]/events/[event-slug]/#event-agenda?passcode=[passCode]
  const regDetailWebsite = attendee?.registrationDetails?.websiteId;
  const regDetailDomain =
    typeof regDetailWebsite === 'object' && regDetailWebsite && 'domain' in regDetailWebsite
      ? regDetailWebsite.domain
      : undefined;

  const websiteDomain =
    (typeof attendee?.websiteId === 'object' && attendee?.websiteId?.domain) ||
    regDetailDomain ||
    (typeof event === 'object' &&
      event?.websites &&
      event.websites.length > 0 &&
      typeof event.websites[0] === 'object' &&
      'domain' in event.websites[0] &&
      (event.websites[0] as { domain?: string }).domain) ||
    'core-mediagroup.com';
  const eventSlug = typeof event === 'object' && event ? event.slug || '' : '';
  const cleanDomain = String(websiteDomain)
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
    .trim();
  const cleanSlug = String(eventSlug)
    .replace(/^\/+|\/+$/g, '')
    .trim();
  const passCode = attendee?.passCode || '';

  const agendaPasscodeUrl = cleanSlug
    ? `https://${cleanDomain}/events/${cleanSlug}/#event-agenda?passcode=${encodeURIComponent(passCode)}`
    : `https://${cleanDomain}/#event-agenda?passcode=${encodeURIComponent(passCode)}`;

  useEffect(() => {
    if (!attendee) return;

    if (agendaPasscodeUrl) {
      QRCode.toDataURL(agendaPasscodeUrl, {
        margin: 1,
        width: 400,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      })
        .then((url) => setDynamicQrUrl(url))
        .catch(() => {
          if (attendee.qrCode && attendee.qrCode.startsWith('data:image')) {
            setDynamicQrUrl(attendee.qrCode);
          } else {
            setDynamicQrUrl('');
          }
        });
    } else if (attendee.qrCode && attendee.qrCode.startsWith('data:image')) {
      setDynamicQrUrl(attendee.qrCode);
    } else {
      setDynamicQrUrl('');
    }
  }, [attendee, agendaPasscodeUrl]);

  if (!isOpen || !attendee) return null;

  const handleCopyCode = async () => {
    if (!passCode) return;
    try {
      await navigator.clipboard.writeText(passCode);
      setCopiedPassCode(true);
      toast.success('Passcode copied to clipboard');
      setTimeout(() => setCopiedPassCode(false), 2000);
    } catch {
      toast.error('Failed to copy passcode');
    }
  };

  const handleCopyUrl = async () => {
    if (!agendaPasscodeUrl) return;
    try {
      await navigator.clipboard.writeText(agendaPasscodeUrl);
      setCopiedLink(true);
      toast.success('Agenda passcode link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const downloadPass = () => {
    const qrSrc = dynamicQrUrl || attendee.qrCode;
    if (!qrSrc) {
      toast.error('QR code not available for download');
      return;
    }
    const link = document.createElement('a');
    link.href = qrSrc;
    link.download = `${attendee.name.replace(/\s+/g, '_')}_Pass_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code image downloaded');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Ticket Wrapper */}
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-navy-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 transform scale-100 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors z-20"
        >
          <X size={18} />
        </button>

        {/* Ticket Header card */}
        <div className="w-full bg-brand-600 dark:bg-brand-700 p-6 pt-8 text-center text-white relative">
          <div className="flex justify-center mb-2 text-white/90">
            <ShieldCheck size={32} className="animate-pulse" />
          </div>
          <h4 className="text-[10px] font-bold tracking-widest uppercase text-brand-200">
            Official Event Admission Pass
          </h4>
          <h2 className="text-lg font-extrabold mt-1 line-clamp-1">{eventTitle}</h2>

          {/* Dotted corner cutouts */}
          <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-gray-900/60 backdrop-blur-sm" />
          <div className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-gray-900/60 backdrop-blur-sm" />
        </div>

        {/* Tear Stripe */}
        <div className="w-full border-t-2 border-dashed border-gray-100 dark:border-navy-700" />

        {/* Ticket Body */}
        <div className="w-full p-6 pt-6 flex flex-col items-center text-center">
          {/* QR Code Container */}
          <div className="relative h-44 w-44 border-2 border-gray-100 dark:border-navy-700 rounded-2xl bg-gray-50 dark:bg-navy-950 p-3 shadow-md flex items-center justify-center group">
            {dynamicQrUrl || attendee.qrCode ? (
              <img
                src={dynamicQrUrl || attendee.qrCode}
                alt="Dynamic Agenda QR Code"
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="text-gray-400 text-xs">QR Code Generating...</div>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{attendee.name}</h3>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{attendee.email}</p>
            {attendee.organization && (
              <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-brand-600 dark:text-brand-400 font-semibold bg-brand-500/5 px-2.5 py-1 rounded-full">
                <Building size={12} />
                <span>{attendee.organization}</span>
              </div>
            )}
          </div>

          {/* Ticket Information Table */}
          <div className="w-full mt-5 bg-gray-50 dark:bg-navy-900/50 rounded-2xl p-4 space-y-3 text-left border border-gray-100 dark:border-navy-700">
            <div className="flex gap-3">
              <Calendar size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                  Date & Time
                </p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {eventDate || 'Scheduled Event'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                  Venue Address
                </p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-2">
                  {eventLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Agenda Passcode Link Pill */}
          <div className="w-full mt-4 bg-indigo-50/70 dark:bg-navy-900/80 rounded-xl p-2.5 border border-indigo-100 dark:border-navy-700 text-left space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                <Globe size={11} /> Dynamic Agenda & Pass Link
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyUrl}
                  className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded hover:bg-white dark:hover:bg-navy-800 transition-colors"
                  title="Copy Agenda Link"
                >
                  {copiedLink ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
                <a
                  href={agendaPasscodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded hover:bg-white dark:hover:bg-navy-800 transition-colors"
                  title="Open Agenda Link"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <p className="text-[10px] font-mono text-gray-600 dark:text-gray-300 truncate">
              {agendaPasscodeUrl}
            </p>
          </div>

          {/* Passcode representation & barcode */}
          <div className="mt-5 flex flex-col items-center gap-1 w-full">
            <div className="h-9 w-full bg-[repeating-linear-gradient(90deg,currentColor,currentColor_2px,transparent_2px,transparent_6px)] text-gray-400 dark:text-navy-700 opacity-60 rounded-md" />
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono tracking-widest text-gray-800 dark:text-white font-bold bg-gray-100 dark:bg-navy-900 px-3 py-1 rounded-lg border border-gray-200 dark:border-navy-700">
                PASS-{passCode || '—'}
              </span>
              {passCode && (
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
                  title="Copy Passcode"
                >
                  {copiedPassCode ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="w-full border-t border-gray-100 dark:border-navy-700 px-6 py-4 bg-gray-50 dark:bg-navy-900/30 flex justify-between items-center rounded-b-3xl gap-4">
          <button
            onClick={downloadPass}
            disabled={!dynamicQrUrl && !attendee.qrCode}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            <Download size={14} />
            Download QR
          </button>
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors animate-fade-in"
            >
              <Printer size={14} />
              Print Pass (PDF)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
