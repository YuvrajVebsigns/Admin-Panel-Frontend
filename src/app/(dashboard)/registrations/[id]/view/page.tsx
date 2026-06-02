import { RegistreeDetailsView } from '@/modules/attendees/components/RegistreeDetailsView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registree Details & Event History - Core Media Admin',
  description:
    'View registree contact details, event registration history, and attendance records.',
};

export default function RegistreeViewPage() {
  return <RegistreeDetailsView />;
}
