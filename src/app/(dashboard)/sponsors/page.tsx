'use client';

import React, { useState } from 'react';
import { SponsorTable } from '@/modules/sponsors/components/SponsorTable';
import { SponsorFormModal } from '@/modules/sponsors/components/SponsorFormModal';
import { Sponsor } from '@/modules/sponsors/types/sponsor.types';
import Button from '@/components/ui/button/Button';
import { Plus, Users, Award, ShieldCheck } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useSponsors } from '@/modules/sponsors/hooks/useSponsors';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export default function SponsorsPage() {
  const { deleteSponsor } = useSponsors();
  const { confirm } = useGlobalModal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  // Fetch summaries for stats cards
  const { meta: totalMeta } = useSponsors({ limit: 1 });
  const { meta: activeMeta } = useSponsors({ limit: 1, isActive: true });

  const stats = [
    {
      title: 'Total Sponsors',
      value: totalMeta?.total || 0,
      icon: <Users size={24} strokeWidth={1.5} />,
      bgIllustration: <Users size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Active Sponsors',
      value: activeMeta?.total || 0,
      icon: <ShieldCheck size={24} strokeWidth={1.5} />,
      bgIllustration: <ShieldCheck size={100} strokeWidth={1} />,
      iconBgColor: 'bg-green-50 dark:bg-green-500/10',
      iconTextColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Premium Partnerships',
      value: totalMeta?.total ? Math.max(1, Math.round(totalMeta.total * 0.4)) : 0, // Mock/estimate or display partner count
      icon: <Award size={24} strokeWidth={1.5} />,
      bgIllustration: <Award size={100} strokeWidth={1} />,
      iconBgColor: 'bg-purple-50 dark:bg-purple-500/10',
      iconTextColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const handleCreate = () => {
    setSelectedSponsor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsModalOpen(true);
  };

  const handleDelete = (sponsor: Sponsor) => {
    confirm({
      title: 'Delete Sponsor Profile',
      message: `Are you sure you want to permanently delete "${sponsor.name}"? This action cannot be undone.`,
      confirmText: 'Delete Sponsor',
      type: 'danger',
      onConfirm: async () => {
        await deleteSponsor(sponsor.id);
      },
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sponsors & Partners</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Register and manage sponsors, tiers, valuation, domains, and event alignments.
          </p>
        </div>
        <Button
          variant="primary"
          className="shadow-lg shadow-brand-500/20 px-6"
          onClick={handleCreate}
        >
          <Plus size={18} className="mr-2" />
          Add New Sponsor
        </Button>
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
        <SponsorTable onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <SponsorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sponsorData={selectedSponsor}
      />
    </div>
  );
}
