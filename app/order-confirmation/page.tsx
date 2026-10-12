import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { OrderConfirmationContent } from './OrderConfirmationContent';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Order Status | Handmade Boutique',
  description: 'View the status and confirmation of your handmade accessories order.',
};

function OrderConfirmationFallback() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      <div className="space-y-4 pt-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<OrderConfirmationFallback />}>
        <OrderConfirmationContent />
      </Suspense>
    </main>
  );
}
