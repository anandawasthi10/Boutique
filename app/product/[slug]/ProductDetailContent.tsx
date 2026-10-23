'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { ApiException } from '@/lib/api/client';
import { Product } from '@/lib/types';
import { ProductGallery } from '@/components/product/ProductGallery';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatCurrency } from '@/lib/format/currency';
import { ProductConfigurator } from '@/components/configurator';

export interface ProductDetailContentProps {
  slug: string;
  configuratorSlot?: React.ReactNode;
}

export const ProductDetailContent: React.FC<ProductDetailContentProps> = ({
  slug,
  configuratorSlot,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string>>({});

  const displayImages = React.useMemo(() => {
    if (!product) return [];
    const baseImages = product.images || [];
    if (!product.variantImages || product.variantImages.length === 0) {
      return baseImages;
    }

    const matchingVariant = product.variantImages.find((vi) => {
      if (vi.fabricOptionId && vi.colourOptionId) {
        const matchesFabric = selectedOptionIds['fabric'] === vi.fabricOptionId;
        const matchesColour = selectedOptionIds['colour'] === vi.colourOptionId;
        if (matchesFabric && matchesColour) return true;
      }
      if (vi.signature) {
        const parts = vi.signature.split('|');
        return (
          parts.length > 0 &&
          parts.every((p) => {
            const [grp, opt] = p.split(':');
            return selectedOptionIds[grp] === opt;
          })
        );
      }
      return false;
    });

    if (matchingVariant) {
      const activeImage = {
        url: matchingVariant.imageUrl,
        alt: matchingVariant.altText || `${product.name} customised view`,
        order: 1,
      };
      const remaining = baseImages.filter((img) => img.url !== matchingVariant.imageUrl);
      return [activeImage, ...remaining];
    }

    return baseImages;
  }, [product, selectedOptionIds]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);

    productsApi
      .getProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (err && typeof err === 'object' && 'digest' in err) {
          throw err;
        }
        if (err instanceof ApiException && err.code === 'PRODUCT_NOT_FOUND') {
          notFound();
          return;
        }
        const msg = err instanceof Error ? err.message : 'Unable to load product at this time.';
        setError(msg);
        setIsLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    let ignore = false;

    productsApi
      .getProductBySlug(slug)
      .then((data) => {
        if (!ignore) {
          setProduct(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (err && typeof err === 'object' && 'digest' in err) {
          throw err;
        }
        if (err instanceof ApiException && err.code === 'PRODUCT_NOT_FOUND') {
          notFound();
          return;
        }
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Unable to load product at this time.';
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [slug]);

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <ErrorState
          title="Could not load product"
          message={error}
          onRetry={loadData}
          retryLabel="Try again"
        />
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div data-testid="product-detail-skeleton" className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
        <Skeleton width="40%" height={20} className="mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery Skeleton */}
          <div className="lg:col-span-7">
            <Skeleton className="aspect-4/5 w-full rounded-[4px]" />
          </div>
          {/* Info Skeleton */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Skeleton width="80%" height={36} />
            <Skeleton width="30%" height={24} />
            <div className="flex flex-col gap-2 mt-4">
              <Skeleton width="100%" height={16} />
              <Skeleton width="90%" height={16} />
              <Skeleton width="75%" height={16} />
            </div>
            <Skeleton width="100%" height={120} className="mt-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop All', href: '/shop' },
          { label: product.category.name, href: `/category/${product.category.id.replace('cat-', '')}` },
          { label: product.name },
        ]}
      />

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pt-4">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery images={displayImages} productName={product.name} />
        </div>

        {/* Right Column: Sticky Purchase & Configurator Area */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28 flex flex-col gap-6">
            {/* Header info */}
            <div className="border-b border-[var(--color-border)] pb-6 flex flex-col gap-2">
              <span className="text-[12px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
                {product.category.name}
              </span>
              <h1 className="text-h1 font-heading text-[var(--color-text)]">
                {product.name}
              </h1>
              <p className="text-price text-[var(--color-text)] font-semibold mt-1">
                From {formatCurrency(product.basePrice)}
              </p>
            </div>

            {/* Product Description - Strictly Plain Text */}
            <div className="text-body text-[var(--color-text)] leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Configurator Slot */}
            <div data-testid="configurator-slot" className="flex flex-col gap-6">
              {configuratorSlot !== undefined ? (
                configuratorSlot
              ) : (
                <ProductConfigurator
                  product={product}
                  onSelectionChange={setSelectedOptionIds}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
