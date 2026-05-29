import { EventDetailsView } from '@/modules/events/components/EventDetailsView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Details & registrations - Core Media Admin',
  description: 'View full event details, aligned sponsors, timelines, and registered attendees.',
};

export default function EventViewPage() {
  return <EventDetailsView />;
}
