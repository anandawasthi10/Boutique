import type { Metadata } from 'next';
import { PrivacyContent } from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Information regarding customer data handling, payments, delivery, and contact procedures.',
};

export default function PrivacyPage() {
  return (
    <main>
      <PrivacyContent />
    </main>
  );
}
