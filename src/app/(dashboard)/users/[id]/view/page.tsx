import { RegistreeDetailsView } from '@/modules/attendees/components/RegistreeDetailsView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Details & History - Core Media Admin',
  description: 'View user contact details, event registration history, and platform engagement.',
};

export default function UserDetailsViewPage() {
  return <RegistreeDetailsView />;
}
