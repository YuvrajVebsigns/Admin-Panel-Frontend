'use client';

import React from 'react';
import { Attendee } from '../types/attendee.types';
import { X, Calendar, MapPin, Building, ShieldCheck, Download } from 'lucide-react';

interface AttendeePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: Attendee | null;
}

export const AttendeePassModal: React.FC<AttendeePassModalProps> = ({
  isOpen,
  onClose,
  attendee,
}) => {
  if (!isOpen || !attendee) return null;

  const event = attendee.eventId;
  const eventTitle = typeof event === 'object' && event ? event.title : 'Event';
  const eventDate =
    typeof event === 'object' && event
      ? new Date(event.startDate).toLocaleDateString([], {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';
  const eventLocation =
    typeof event === 'object' && event ? event.location?.address || 'Online Venue' : 'Online Venue';

  const downloadPass = () => {
    if (!attendee.qrCode) return;
    const link = document.createElement('a');
    link.href = attendee.qrCode;
    link.download = `${attendee.name.replace(/\s+/g, '_')}_Pass.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Ticket Header card */}
        <div className="w-full bg-brand-600 dark:bg-brand-700 p-6 pt-8 text-center text-white relative">
          <div className="flex justify-center mb-2 text-white/90">
            <ShieldCheck size={32} className="animate-pulse" />
          </div>
          <h4 className="text-xs font-bold tracking-widest uppercase text-brand-200">
            Official Event Pass
          </h4>
          <h2 className="text-lg font-extrabold mt-1 line-clamp-1">{eventTitle}</h2>

          {/* Dotted corner cutouts */}
          <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-gray-900/60 backdrop-blur-sm" />
          <div className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-gray-900/60 backdrop-blur-sm" />
        </div>

        {/* Tear Stripe */}
        <div className="w-full border-t-2 border-dashed border-gray-100 dark:border-navy-700" />

        {/* Ticket Body */}
        <div className="w-full p-6 pt-8 flex flex-col items-center text-center">
          {/* QR Code Container */}
          <div className="relative h-44 w-44 border-2 border-gray-100 dark:border-navy-700 rounded-2xl bg-gray-50 dark:bg-navy-950 p-3 shadow-md flex items-center justify-center">
            {attendee.qrCode ? (
              <img
                src={attendee.qrCode}
                alt="Verification QR Code"
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="text-gray-400 text-xs">QR Code unavailable</div>
            )}
          </div>

          <div className="mt-5">
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
          <div className="w-full mt-6 bg-gray-50 dark:bg-navy-900/50 rounded-2xl p-4 space-y-3.5 text-left border border-gray-100 dark:border-navy-700">
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

          {/* Barcode representation */}
          <div className="mt-7 flex flex-col items-center gap-1 w-full">
            <div className="h-10 w-full bg-[repeating-linear-gradient(90deg,currentColor,currentColor_2px,transparent_2px,transparent_6px)] text-gray-400 dark:text-navy-700 opacity-60 rounded-md" />
            <span className="text-[10px] font-mono tracking-widest text-gray-500 font-bold">
              PASS-{attendee.passCode}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="w-full border-t border-gray-100 dark:border-navy-700 px-6 py-4 bg-gray-50 dark:bg-navy-900/30 flex justify-center rounded-b-3xl">
          <button
            onClick={downloadPass}
            disabled={!attendee.qrCode}
            className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            <Download size={14} />
            Download QR Pass Code
          </button>
        </div>
      </div>
    </div>
  );
};
