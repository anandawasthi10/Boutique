'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order, OrdersResponse } from '@/lib/types';
import { AccountLayout } from '@/components/account/AccountLayout';
import { OrderCard } from '@/components/account/OrderCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';

export const OrdersContent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    ordersApi
      .getOrders({ page, pageSize: 5 })
      .then((res: OrdersResponse) => {
        if (!ignore) {
          setOrders(res.items);
          setPage(res.page);
          setTotalPages(res.totalPages);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Unable to load orders. Please try again.';
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, refreshKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <AccountLayout
      title="My Orders"
      description="View and track your previous handcrafted accessory purchases."
    >
      <div className="space-y-6">
        {/* Loading Skeleton */}
        {isLoading && (
          <div data-testid="orders-loading-skeleton" className="space-y-4">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorState
            title="Failed to Load Orders"
            message={error}
            onRetry={handleRetry}
          />
        )}

        {/* Empty State with link to /shop */}
        {!isLoading && !error && orders.length === 0 && (
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />}
            title="No Orders Yet"
            description="You haven't placed any handcrafted accessory orders yet. Explore our bespoke catalogue and build your collection."
          >
            <Link href="/shop">
              <Button variant="primary" data-testid="orders-empty-shop-btn">
                Explore Shop
              </Button>
            </Link>
          </EmptyState>
        )}

        {/* Orders List */}
        {!isLoading && !error && orders.length > 0 && (
          <div data-testid="orders-list" className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav
                aria-label="Orders pagination"
                className="flex items-center justify-between pt-6 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  data-testid="pagination-prev-btn"
                  className="inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Previous</span>
                </Button>

                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  data-testid="pagination-next-btn"
                  className="inline-flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </nav>
            )}
          </div>
        )}
      </div>
    </AccountLayout>
  );
};
