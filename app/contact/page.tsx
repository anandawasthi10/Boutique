import type { Metadata } from 'next';
import { ContactContent } from './ContactContent';

export const metadata: Metadata = {
  title: 'Contact & Atelier Location | Handmade Boutique',
  description:
    'Reach our studio concierge or find directions to our handmade accessories atelier in Indiranagar, Bengaluru.',
};

export default function ContactPage() {
  return (
    <div>
      <ContactContent />
    </div>
  );
}
