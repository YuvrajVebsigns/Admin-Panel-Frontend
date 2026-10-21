'use client';

import React, { useState } from 'react';
import { ContactTable } from '@/modules/contacts/components/ContactTable';
import { ContactReplyModal } from '@/modules/contacts/components/ContactReplyModal';
import { Contact, ContactStatus } from '@/modules/contacts/types/contact.types';
import { Mail, Clock, CheckCircle2 } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useContacts } from '@/modules/contacts/hooks/useContacts';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export default function ContactsPage() {
  const { deleteContact } = useContacts();
  const { confirm } = useGlobalModal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Fetch summaries for stats cards
  const { meta: totalMeta } = useContacts({ limit: 1 });
  const { meta: pendingMeta } = useContacts({ limit: 1, status: ContactStatus.PENDING });
  const { meta: repliedMeta } = useContacts({ limit: 1, status: ContactStatus.REPLIED });

  const stats = [
    {
      title: 'Total Inquiries',
      value: totalMeta?.total || 0,
      icon: <Mail size={24} strokeWidth={1.5} />,
      bgIllustration: <Mail size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Pending Responses',
      value: pendingMeta?.total || 0,
      icon: <Clock size={24} strokeWidth={1.5} />,
      bgIllustration: <Clock size={100} strokeWidth={1} />,
      iconBgColor: 'bg-amber-50 dark:bg-amber-500/10',
      iconTextColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Replied & Closed',
      value: repliedMeta?.total || 0,
      icon: <CheckCircle2 size={24} strokeWidth={1.5} />,
      bgIllustration: <CheckCircle2 size={100} strokeWidth={1} />,
      iconBgColor: 'bg-green-50 dark:bg-green-500/10',
      iconTextColor: 'text-green-600 dark:text-green-400',
    },
  ];

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = (contact: Contact) => {
    confirm({
      title: 'Delete Inquiry Record',
      message: `Are you sure you want to permanently delete the inquiry from "${contact.fullName}"? This action cannot be undone.`,
      confirmText: 'Delete Submission',
      type: 'danger',
      onConfirm: async () => {
        await deleteContact(contact.id);
      },
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Get in Touch Inquiries
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Track, manage, and reply to client inquiries received from your public portals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <SummaryCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgIllustration={stat.bgIllustration}
            iconBgColor={stat.iconBgColor}
            iconTextColor={stat.iconTextColor}
            isActive={false}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-gray-100 dark:border-navy-800 shadow-sm">
        <ContactTable onViewDetails={handleViewDetails} onDelete={handleDelete} />
      </div>

      <ContactReplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contactData={selectedContact}
      />
    </div>
  );
}
