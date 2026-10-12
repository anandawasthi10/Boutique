'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import { ordersApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  PaymentResultPending,
  PaymentResultFailed,
  PaymentResultCancelled,
  PaymentResultSuccess,
} from '@/components/checkout';

const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 2500;

export const OrderConfirmationContent: React.FC = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldNotFound, setShouldNotFound] = useState(false);

  // Polling state for pending payments
  const [pollCount, setPollCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadOrder = useCallback((isManual = false) => {
    if (!orderId) {
      setShouldNotFound(true);
      setIsLoading(false);
      return;
    }

    if (isManual) {
      setIsRefreshing(true);
    }

    ordersApi
      .getOrderById(orderId)
      .then((data) => {
        setOrder(data);
        setError(null);

        let text = `Order status: ${data.status}, Payment status: ${data.paymentStatus}.`;
        if (data.paymentStatus === 'paid') {
          text = `Payment successful. Order number is ${data.orderNumber}.`;
        } else if (data.paymentStatus === 'pending') {
          text = `Payment is currently pending for order ${data.orderNumber}.`;
        } else if (data.paymentStatus === 'failed') {
          text = `Payment failed for order ${data.orderNumber}.`;
        } else if (data.paymentStatus === 'cancelled') {
          text = `Payment was cancelled for order ${data.orderNumber}.`;
        }
        setAnnouncement(text);
      })
      .catch((err: unknown) => {
        const e = err as { code?: string; status?: number; message?: string };
        if (
          e.code === 'ORDER_NOT_FOUND' ||
          e.code === 'NOT_FOUND' ||
          e.status === 404 ||
          e.message?.toLowerCase().includes('not found')
        ) {
          setShouldNotFound(true);
        } else {
          setError(e.message || 'Unable to retrieve order details. Please try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
        if (isManual) {
          setIsRefreshing(false);
        }
      });
  }, [orderId]);

  // Initial load via promise callbacks
  useEffect(() => {
    if (!orderId) {
      const timer = setTimeout(() => {
        setShouldNotFound(true);
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let ignore = false;
    ordersApi
      .getOrderById(orderId)
      .then((data) => {
        if (!ignore) {
          setOrder(data);
          setError(null);
          let text = `Order status: ${data.status}, Payment status: ${data.paymentStatus}.`;
          if (data.paymentStatus === 'paid') {
            text = `Payment successful. Order number is ${data.orderNumber}.`;
          } else if (data.paymentStatus === 'pending') {
            text = `Payment is currently pending for order ${data.orderNumber}.`;
          } else if (data.paymentStatus === 'failed') {
            text = `Payment failed for order ${data.orderNumber}.`;
          } else if (data.paymentStatus === 'cancelled') {
            text = `Payment was cancelled for order ${data.orderNumber}.`;
          }
          setAnnouncement(text);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const e = err as { code?: string; status?: number; message?: string };
          if (
            e.code === 'ORDER_NOT_FOUND' ||
            e.code === 'NOT_FOUND' ||
            e.status === 404 ||
            e.message?.toLowerCase().includes('not found')
          ) {
            setShouldNotFound(true);
          } else {
            setError(e.message || 'Unable to retrieve order details. Please try again.');
          }
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [orderId]);

  // Handle polling when paymentStatus is 'pending'
  useEffect(() => {
    if (!order || order.paymentStatus !== 'pending') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    if (pollCount < MAX_POLL_ATTEMPTS) {
      timerRef.current = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        loadOrder(false);
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [order, pollCount, loadOrder]);

  // Trigger Next.js not-found if order does not exist or doesn't belong to customer
  if (shouldNotFound) {
    notFound();
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        data-testid="order-confirmation-loading"
        className="max-w-3xl mx-auto px-4 py-12 space-y-6"
      >
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

  // Generic error state (e.g. network failure)
  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <ErrorState
          title="Could Not Load Order"
          message={error || 'An unexpected error occurred while loading your order.'}
          onRetry={() => {
            setIsLoading(true);
            loadOrder(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-6">
      {/* Screen reader live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {order.paymentStatus === 'pending' && (
        <PaymentResultPending
          order={order}
          isPolling={pollCount < MAX_POLL_ATTEMPTS}
          pollCount={pollCount}
          maxPolls={MAX_POLL_ATTEMPTS}
          onRefresh={() => loadOrder(true)}
          isRefreshing={isRefreshing}
        />
      )}

      {order.paymentStatus === 'failed' && (
        <PaymentResultFailed order={order} />
      )}

      {order.paymentStatus === 'cancelled' && (
        <PaymentResultCancelled order={order} />
      )}

      {order.paymentStatus === 'paid' && (
        <PaymentResultSuccess order={order} />
      )}
    </div>
  );
};
