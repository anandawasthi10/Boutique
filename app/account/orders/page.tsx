import { Suspense } from 'react';
import { Metadata } from 'next';
import { OrdersContent } from './OrdersContent';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'My Orders | Handmade Boutique',
  description: 'View and track your previous handcrafted accessory purchases.',
};

function OrdersFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-4">
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-44 w-full rounded-xl" />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersFallback />}>
      <OrdersContent />
    </Suspense>
  );
}
