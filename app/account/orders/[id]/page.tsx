import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { OrderDetailContent } from './OrderDetailContent';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Order Details | Handmade Boutique',
  description: 'View order items, delivery details, and production timeline.',
};

function OrderDetailFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

async function OrderDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailContent orderId={id} />;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<OrderDetailFallback />}>
      <OrderDetailWrapper params={params} />
    </Suspense>
  );
}
