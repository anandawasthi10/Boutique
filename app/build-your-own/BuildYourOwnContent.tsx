'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { productsApi } from '@/lib/api';
import { Product, ProductSummary } from '@/lib/types';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductConfigurator } from '@/components/configurator/ProductConfigurator';
import { formatCurrency } from '@/lib/format/currency';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const BuildYourOwnContent: React.FC = () => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [isLoadingFullProduct, setIsLoadingFullProduct] = useState<boolean>(false);
  const [fullProductError, setFullProductError] = useState<string | null>(null);

  // Load available products from the API
  const loadProducts = useCallback(() => {
    setIsLoadingProducts(true);
    setProductsError(null);

    productsApi
      .getProducts()
      .then((res) => {
        setProducts(res.items || []);
        setIsLoadingProducts(false);
      })
      .catch((err) => {
        setProductsError(err instanceof Error ? err.message : 'Failed to load customizable products.');
        setIsLoadingProducts(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    productsApi
      .getProducts()
      .then((res) => {
        if (active) {
          setProducts(res.items || []);
          setIsLoadingProducts(false);
        }
      })
      .catch((err) => {
        if (active) {
          setProductsError(err instanceof Error ? err.message : 'Failed to load customizable products.');
          setIsLoadingProducts(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Load full product when user chooses one
  const loadFullProduct = useCallback((slug: string) => {
    setIsLoadingFullProduct(true);
    setFullProductError(null);

    let active = true;
    productsApi
      .getProductBySlug(slug)
      .then((prod) => {
        if (active) {
          setFullProduct(prod);
          setIsLoadingFullProduct(false);
        }
      })
      .catch((err) => {
        if (active) {
          setFullProductError(err instanceof Error ? err.message : 'Failed to load product configurator.');
          setIsLoadingFullProduct(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSelectProduct = (slug: string) => {
    // Changing the product resets selections and loads new product
    setSelectedProductSlug(slug);
    setFullProduct(null);
    loadFullProduct(slug);
  };

  const handleBackToPicker = () => {
    setSelectedProductSlug(null);
    setFullProduct(null);
    setFullProductError(null);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Build Your Own' },
          ...(fullProduct ? [{ label: fullProduct.name }] : []),
        ]}
      />

      {/* Header section */}
      <div className="my-6 border-b border-[var(--color-border)] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[12px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            Bespoke Studio
          </span>
          <h1 className="text-h1 font-heading text-[var(--color-text)] mt-1">
            Build Your Own
          </h1>
          <p className="text-body text-[var(--color-text-muted)] max-w-xl mt-2">
            Pick a base accessory handcrafted in our studio, then choose your bespoke fabrics, colours, and tailored finishes.
          </p>
        </div>

        {selectedProductSlug && (
          <Button
            variant="secondary"
            onClick={handleBackToPicker}
            className="self-start sm:self-auto text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Choose Different Piece
          </Button>
        )}
      </div>

      {/* State 1: Products Error */}
      {productsError && (
        <div className="py-8">
          <ErrorState
            title="Could not load studio pieces"
            message={productsError}
            onRetry={loadProducts}
            retryLabel="Retry"
          />
        </div>
      )}

      {/* State 2: Products Loading */}
      {isLoadingProducts && !productsError && (
        <div data-testid="build-your-own-loading" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 py-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-4/5 w-full rounded-[4px]" />
              <Skeleton height={20} width="70%" />
              <Skeleton height={16} width="40%" />
            </div>
          ))}
        </div>
      )}

      {/* State 3: Products Empty */}
      {!isLoadingProducts && !productsError && products.length === 0 && (
        <div className="py-12">
          <EmptyState
            title="No accessories available"
            description="Our studio is currently preparing new handcrafted accessories. Please check back shortly."
            actionLabel="Refresh pieces"
            onAction={loadProducts}
          />
        </div>
      )}

      {/* State 4: Product Picker Grid (when no product is currently active) */}
      {!selectedProductSlug && !isLoadingProducts && !productsError && products.length > 0 && (
        <div data-testid="product-picker-section" className="py-4">
          <h2 className="text-h3 font-heading text-[var(--color-text)] mb-6">
            Step 1: Choose your base accessory
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((prod) => {
              const image = prod.images[0]?.url || '/images/products/placeholder.svg';
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleSelectProduct(prod.slug)}
                  data-testid={`picker-item-${prod.slug}`}
                  className="group flex flex-col text-left p-3 rounded-[4px] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
                >
                  <div className="relative aspect-4/5 w-full rounded-[3px] overflow-hidden bg-[var(--color-surface-alt)] mb-3">
                    <Image
                      src={image}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
                    {prod.category.name}
                  </span>
                  <h3 className="text-sm font-semibold text-[var(--color-text)] mt-0.5 line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text)] font-medium mt-1">
                    From {formatCurrency(prod.basePrice)}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-semibold text-[var(--color-primary)]">
                    <span>Customize this</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* State 5: Configurator Active for Selected Product */}
      {selectedProductSlug && (
        <div data-testid="active-configurator-section" className="py-4">
          {isLoadingFullProduct ? (
            <div data-testid="configurator-loading" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 py-4">
              <div className="lg:col-span-7">
                <Skeleton className="aspect-4/5 w-full rounded-[4px]" />
              </div>
              <div className="lg:col-span-5 flex flex-col gap-4">
                <Skeleton height={32} width="80%" />
                <Skeleton height={24} width="40%" />
                <Skeleton height={140} width="100%" className="mt-4" />
                <Skeleton height={120} width="100%" className="mt-4" />
              </div>
            </div>
          ) : fullProductError ? (
            <div className="py-8">
              <ErrorState
                title="Could not open configurator"
                message={fullProductError}
                onRetry={() => loadFullProduct(selectedProductSlug)}
                retryLabel="Try again"
              />
            </div>
          ) : fullProduct ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 py-2">
              {/* Left Column: Product Gallery */}
              <div className="lg:col-span-7">
                <ProductGallery
                  images={fullProduct.images}
                  productName={fullProduct.name}
                />
              </div>

              {/* Right Column: Sticky Configurator Area */}
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-28 flex flex-col gap-6">
                  <div className="border-b border-[var(--color-border)] pb-4">
                    <span className="text-[12px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
                      {fullProduct.category.name}
                    </span>
                    <h2 className="text-h2 font-heading text-[var(--color-text)] mt-1">
                      {fullProduct.name}
                    </h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                      {fullProduct.description}
                    </p>
                  </div>

                  {/* The Same Configurator Component Used on Product Detail Page */}
                  <ProductConfigurator product={fullProduct} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
