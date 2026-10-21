'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { EventManagement, EventMeeting } from '../types/event.types';
import { useEventAttendees } from '@/modules/attendees/hooks/useAttendees';
import { useSponsors } from '@/modules/sponsors/hooks/useSponsors';
import { useCreateEventMeeting, useUpdateEventMeeting } from '../hooks/useEvents';
import { X, Clock, User, Building2, MessageSquare, Check, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface EventMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventManagement;
  meetingToEdit?: EventMeeting | null;
}

export const EventMeetingModal: React.FC<EventMeetingModalProps> = ({
  isOpen,
  onClose,
  event,
  meetingToEdit,
}) => {
  const isEdit = !!meetingToEdit;
  const { data: attendees = [], isLoading: isAttendeesLoading } = useEventAttendees(event.id);
  const { sponsors = [], isLoading: isSponsorsLoading } = useSponsors({ limit: 1000 });

  const createMeetingMutation = useCreateEventMeeting();
  const updateMeetingMutation = useUpdateEventMeeting();

  // Form states
  const [selectedAgendaIdx, setSelectedAgendaIdx] = useState<number>(-1);
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Search filter states
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [showAttendeeDropdown, setShowAttendeeDropdown] = useState(false);
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [showSponsorDropdown, setShowSponsorDropdown] = useState(false);

  // Initialize fields on Edit
  useEffect(() => {
    if (isOpen) {
      if (meetingToEdit) {
        setSelectedAgendaIdx(meetingToEdit.agendaIndex);

        // Extract IDs from potentially populated objects
        const attIds = (meetingToEdit.attendeeIds || []).map((att) =>
          typeof att === 'string' ? att : att.id,
        );
        setSelectedAttendeeIds(attIds);

        const spId =
          typeof meetingToEdit.sponsorId === 'string'
            ? meetingToEdit.sponsorId
            : meetingToEdit.sponsorId?.id || '';
        setSelectedSponsorId(spId);

        // Match search field with loaded sponsor name
        if (meetingToEdit.sponsorId) {
          const sponsorObj = sponsors.find((s) => s.id === spId);
          setSponsorSearch(sponsorObj ? sponsorObj.name : '');
        } else {
          setSponsorSearch('');
        }

        setNotes(meetingToEdit.notes || '');
      } else {
        // Reset states for create
        setSelectedAgendaIdx(-1);
        setSelectedAttendeeIds([]);
        setSelectedSponsorId('');
        setSponsorSearch('');
        setNotes('');
      }
      setAttendeeSearch('');
      setShowAttendeeDropdown(false);
      setShowSponsorDropdown(false);
    }
  }, [isOpen, meetingToEdit, sponsors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAgendaIdx < 0) {
      toast.error('Please select an agenda time slot');
      return;
    }
    if (selectedAttendeeIds.length === 0) {
      toast.error('Please select at least one invitee attendee');
      return;
    }
    if (!selectedSponsorId) {
      toast.error('Please select a sponsor');
      return;
    }

    const agendaItem = event.agenda?.[selectedAgendaIdx];
    if (!agendaItem) {
      toast.error('Invalid agenda slot selected');
      return;
    }
    const payload = {
      eventId: event.id,
      agendaIndex: selectedAgendaIdx,
      agendaTime: agendaItem.time,
      agendaTitle: agendaItem.title,
      attendeeIds: selectedAttendeeIds,
      sponsorId: selectedSponsorId,
      notes: notes || undefined,
    };

    try {
      if (isEdit && meetingToEdit) {
        await updateMeetingMutation.mutateAsync({
          eventId: event.id,
          meetingId: meetingToEdit.id,
          data: payload,
        });
      } else {
        await createMeetingMutation.mutateAsync({
          eventId: event.id,
          data: payload,
        });
      }
      onClose();
    } catch (err) {
      // toast notification is already shown in mutation hook onError
    }
  };

  // Filters
  const filteredAttendees = attendees.filter((a) => {
    const isSelected = selectedAttendeeIds.includes(a.id);
    if (isSelected) return false;
    const term = attendeeSearch.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      (a.organization && a.organization.toLowerCase().includes(term))
    );
  });

  const filteredSponsors = sponsors.filter((s) => {
    const term = sponsorSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.companyName && s.companyName.toLowerCase().includes(term))
    );
  });

  // Helpers to select/deselect
  const toggleAttendee = (id: string) => {
    setSelectedAttendeeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    setAttendeeSearch('');
  };

  const removeAttendee = (id: string) => {
    setSelectedAttendeeIds((prev) => prev.filter((item) => item !== id));
  };

  const selectSponsor = (id: string, name: string) => {
    setSelectedSponsorId(id);
    setSponsorSearch(name);
    setShowSponsorDropdown(false);
  };

  const isSubmitting = createMeetingMutation.isPending || updateMeetingMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Meeting Reservation' : 'Book Guest-Sponsor Meeting'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Agenda Slot */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <Clock size={14} className="text-brand-500" />
            Agenda Slot
            <span className="text-brand-500">*</span>
          </label>
          <div className="relative group">
            <select
              value={selectedAgendaIdx}
              onChange={(e) => setSelectedAgendaIdx(Number(e.target.value))}
              className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-200 dark:border-navy-600 bg-gray-50 dark:bg-navy-900/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer appearance-none hover:border-gray-300 dark:hover:border-navy-500"
            >
              <option value={-1}>-- Select an Agenda Slot --</option>
              {event.agenda &&
                event.agenda.map((item, idx) => (
                  <option key={idx} value={idx}>
                    {item.time} — {item.title}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-gray-500 transition-colors">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Invitees (Attendees) Search-MultiSelect */}
        <div className="space-y-2 relative">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <User size={14} className="text-brand-500" />
            Invitee Guests
            <span className="text-brand-500">*</span>
            {selectedAttendeeIds.length > 0 && (
              <span className="ml-auto text-xs font-medium text-gray-400 dark:text-gray-500">
                {selectedAttendeeIds.length} selected
              </span>
            )}
          </label>

          {/* Selected badges */}
          {selectedAttendeeIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 dark:bg-navy-900/40 rounded-xl border border-gray-100 dark:border-navy-700/50">
              {selectedAttendeeIds.map((id) => {
                const attObj = attendees.find((a) => a.id === id);
                return (
                  <div
                    key={id}
                    className="group/badge inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-navy-700 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg border border-gray-150 dark:border-navy-600 shadow-sm hover:border-brand-200 dark:hover:border-brand-500/30 transition-all"
                  >
                    <span className="w-4 h-4 rounded-full bg-brand-50 dark:bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                      <User size={10} className="text-brand-500" />
                    </span>
                    <span className="truncate max-w-[120px]">
                      {attObj ? attObj.name : 'Unknown Guest'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttendee(id)}
                      className="ml-0.5 p-0.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search invitee name, email, or company..."
              value={attendeeSearch}
              onChange={(e) => {
                setAttendeeSearch(e.target.value);
                setShowAttendeeDropdown(true);
              }}
              onFocus={() => setShowAttendeeDropdown(true)}
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 dark:border-navy-600 bg-gray-50 dark:bg-navy-900/60 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-gray-300 dark:hover:border-navy-500 transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            {attendeeSearch && (
              <button
                type="button"
                onClick={() => setAttendeeSearch('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showAttendeeDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAttendeeDropdown(false)} />
              <div className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 shadow-xl ring-1 ring-black/5 dark:ring-white/5">
                {isAttendeesLoading ? (
                  <div className="px-4 py-6 text-center">
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs text-gray-400">Loading guests...</span>
                  </div>
                ) : filteredAttendees.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <User size={20} className="mx-auto text-gray-300 dark:text-gray-600 mb-1.5" />
                    <span className="text-xs text-gray-400">No guests found</span>
                  </div>
                ) : (
                  filteredAttendees.map((att) => (
                    <button
                      key={att.id}
                      type="button"
                      onClick={() => toggleAttendee(att.id)}
                      className="w-full px-4 py-3 text-left hover:bg-brand-50/50 dark:hover:bg-brand-500/5 flex items-center gap-3 transition-colors border-b border-gray-50 dark:border-navy-700/50 last:border-0 group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-navy-700 flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand-100 dark:group-hover/item:bg-brand-500/15 transition-colors">
                        <User
                          size={14}
                          className="text-gray-400 group-hover/item:text-brand-500 transition-colors"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                          {att.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {att.email} {att.organization ? `· ${att.organization}` : ''}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Sponsor Search-SingleSelect */}
        <div className="space-y-2 relative">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <Building2 size={14} className="text-brand-500" />
            Sponsor
            <span className="text-brand-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search & select sponsor..."
              value={sponsorSearch}
              onChange={(e) => {
                setSponsorSearch(e.target.value);
                setSelectedSponsorId(''); // Reset selected if typing
                setShowSponsorDropdown(true);
              }}
              onFocus={() => setShowSponsorDropdown(true)}
              className={`w-full h-11 pl-10 pr-16 rounded-xl border text-sm transition-all hover:border-gray-300 dark:hover:border-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                selectedSponsorId
                  ? 'border-success-200 dark:border-success-500/30 bg-success-50/50 dark:bg-success-500/5 text-gray-900 dark:text-white font-semibold'
                  : 'border-gray-200 dark:border-navy-600 bg-gray-50 dark:bg-navy-900/60 text-gray-900 dark:text-white'
              }`}
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Building2 size={16} />
            </div>
            {selectedSponsorId && (
              <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-500/15 rounded-md">
                  <Check size={10} />
                  Selected
                </span>
              </div>
            )}
            {sponsorSearch && (
              <button
                type="button"
                onClick={() => {
                  setSponsorSearch('');
                  setSelectedSponsorId('');
                }}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showSponsorDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSponsorDropdown(false)} />
              <div className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 shadow-xl ring-1 ring-black/5 dark:ring-white/5">
                {isSponsorsLoading ? (
                  <div className="px-4 py-6 text-center">
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs text-gray-400">Loading sponsors...</span>
                  </div>
                ) : filteredSponsors.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Building2
                      size={20}
                      className="mx-auto text-gray-300 dark:text-gray-600 mb-1.5"
                    />
                    <span className="text-xs text-gray-400">No sponsors found</span>
                  </div>
                ) : (
                  filteredSponsors.map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => selectSponsor(sp.id, sp.name)}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors border-b border-gray-50 dark:border-navy-700/50 last:border-0 group/item ${
                        selectedSponsorId === sp.id
                          ? 'bg-brand-50/70 dark:bg-brand-500/10'
                          : 'hover:bg-brand-50/50 dark:hover:bg-brand-500/5'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          selectedSponsorId === sp.id
                            ? 'bg-brand-100 dark:bg-brand-500/20'
                            : 'bg-gray-100 dark:bg-navy-700 group-hover/item:bg-brand-100 dark:group-hover/item:bg-brand-500/15'
                        }`}
                      >
                        <Building2
                          size={14}
                          className={`transition-colors ${
                            selectedSponsorId === sp.id
                              ? 'text-brand-500'
                              : 'text-gray-400 group-hover/item:text-brand-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                          {sp.name}
                        </p>
                        {sp.companyName && (
                          <p className="text-xs text-gray-400 truncate">{sp.companyName}</p>
                        )}
                      </div>
                      {selectedSponsorId === sp.id && (
                        <Check size={16} className="text-brand-500 flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Meeting Notes */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <MessageSquare size={14} className="text-gray-400" />
            Meeting Notes / Agenda Detail
            <span className="ml-auto text-xs font-normal text-gray-400">Optional</span>
          </label>
          <textarea
            rows={3}
            placeholder="Provide meeting purpose or details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-navy-600 bg-gray-50 dark:bg-navy-900/60 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-gray-300 dark:hover:border-navy-500 transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting} isLoading={isSubmitting}>
            {isEdit ? 'Update Meeting' : 'Book Meeting'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
