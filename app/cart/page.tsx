import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/config/site';
import { CartPageContent } from './CartPageContent';

export const metadata: Metadata = {
  title: `Shopping Bag | ${SITE_CONFIG.brandName}`,
  description: 'Review items in your bespoke shopping bag and customize your handcrafted accessories.',
};

export default function CartPage() {
  return <CartPageContent />;
}
