import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShopContent } from './ShopContent';
import { ProductGrid } from '@/components/catalogue';

export const metadata: Metadata = {
  title: 'Shop All Accessories | Handmade Collection',
  description: 'Browse our full collection of handcrafted fabric accessories.',
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
          <ProductGrid isLoading={true} />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
