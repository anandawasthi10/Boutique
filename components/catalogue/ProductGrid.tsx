'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProductSummary } from '@/lib/types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';

export interface ProductGridProps {
  products?: ProductSummary[];
  isLoading?: boolean;
  skeletonCount?: number;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  headingLevel?: 'h2' | 'h3' | 'h4';
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products = [],
  isLoading = false,
  skeletonCount = 4,
  error = null,
  onRetry,
  emptyTitle = 'No products found',
  emptyDescription = 'There are no items matching this criteria at the moment.',
  headingLevel,
  className = '',
}) => {
  const router = useRouter();

  if (error) {
    return (
      <div className="py-12" data-testid="product-grid-error">
        <ErrorState
          title="Could not load products"
          message={error}
          onRetry={onRetry}
          retryLabel="Try again"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        data-testid="product-grid-skeleton"
        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 ${className}`.trim()}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-4/5 w-full rounded-[4px]" />
            <Skeleton width="75%" height={20} />
            <Skeleton width="40%" height={16} />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12" data-testid="product-grid-empty">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel="View all products"
          onAction={() => {
            router.push('/shop');
          }}
        />
      </div>
    );
  }

  return (
    <div
      data-testid="product-grid"
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 ${className}`.trim()}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} headingLevel={headingLevel} />
      ))}
    </div>
  );
};
