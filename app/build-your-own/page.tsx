import type { Metadata } from 'next';
import { BuildYourOwnContent } from './BuildYourOwnContent';
import { SITE_CONFIG } from '@/lib/config/site';

export const metadata: Metadata = {
  title: `Build Your Own | ${SITE_CONFIG.brandName}`,
  description: 'Design and personalise your bespoke handcrafted fabric accessories.',
};

export default function BuildYourOwnPage() {
  return <BuildYourOwnContent />;
}
