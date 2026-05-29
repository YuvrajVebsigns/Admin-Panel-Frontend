import { AttendeeDetailsView } from '@/modules/attendees/components/AttendeeDetailsView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Attendee Details & Registration History - Core Media Admin',
  description:
    'View attendee contact details, verified boarding passes, check-in history, and event list.',
};

export default function AttendeeViewPage() {
  return <AttendeeDetailsView />;
}
