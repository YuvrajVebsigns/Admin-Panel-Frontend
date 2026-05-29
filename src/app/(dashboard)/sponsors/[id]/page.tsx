import { SponsorDetailsView } from '@/modules/sponsors/components/SponsorDetailsView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sponsor Profile details & Alignments - Core Media Admin',
  description: 'View sponsor profile details, sponsored events, and visitor check-in counts.',
};

export default function SponsorDetailPage() {
  return <SponsorDetailsView />;
}
