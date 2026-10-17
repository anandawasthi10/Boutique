import type { Metadata } from 'next';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
  title: 'Our Story & Atelier | Handmade Boutique',
  description:
    'Learn about our independent handmade accessories atelier, natural fabrics, and small-batch craftsmanship philosophy.',
};

export default function AboutPage() {
  return (
    <div>
      <AboutContent />
    </div>
  );
}
