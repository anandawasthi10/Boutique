import type { Metadata } from 'next';
import { TermsContent } from './TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Information regarding ordering terms, handcrafted item customisation, payments, and store guidelines.',
};

export default function TermsPage() {
  return (
    <div>
      <TermsContent />
    </div>
  );
}
