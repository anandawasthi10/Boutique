'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import { productsApi, categoriesApi } from '@/lib/api';
import { ProductSummary, CategorySummary } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/components/catalogue/ProductGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export default function HomePage() {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const loadData = React.useCallback(() => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    setProductsLoading(true);
    setProductsError(null);

    categoriesApi
      .getCategories()
      .then((cats) => {
        setCategories(cats);
        setCategoriesLoading(false);
      })
      .catch(() => {
        setCategoriesError('Unable to load categories at this time.');
        setCategoriesLoading(false);
      });

    productsApi
      .getProducts()
      .then((prods) => {
        setProducts(prods.items);
        setProductsLoading(false);
      })
      .catch(() => {
        setProductsError('Unable to load featured products.');
        setProductsLoading(false);
      });
  }, []);

  useEffect(() => {
    let ignore = false;

    categoriesApi
      .getCategories()
      .then((cats) => {
        if (!ignore) {
          setCategories(cats);
          setCategoriesLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCategoriesError('Unable to load categories at this time.');
          setCategoriesLoading(false);
        }
      });

    productsApi
      .getProducts()
      .then((prods) => {
        if (!ignore) {
          setProducts(prods.items);
          setProductsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setProductsError('Unable to load featured products.');
          setProductsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-16 md:gap-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative w-full border-b border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div className="inline-flex items-center px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px]">
              <span className="text-label text-[var(--color-text)]">Handmade Accessories</span>
            </div>

            <h1 className="text-display text-[var(--color-text)] tracking-tight">
              Crafted in fabric, <span className="text-script block sm:inline font-normal text-[var(--color-text-muted)]">tailored by you.</span>
            </h1>

            <p className="text-body text-[var(--color-text-muted)] max-w-xl">
              Choose your fabric, size, and finishes for hair ties, everyday pouches, and tech sleeves.
              Made by hand with tactile materials, designed to last.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <NextLink href="/shop">
                <Button variant="primary">Shop All Collection</Button>
              </NextLink>
              <NextLink href="/build-your-own">
                <Button variant="secondary">
                  Build Your Own
                </Button>
              </NextLink>
            </div>
          </div>

          {/* Right Hero Image Column */}
          <div className="lg:col-span-5 w-full">
            <div className="relative aspect-4/5 w-full rounded-[4px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
              <Image
                src="/images/productimages/pouch-and-scrunchies.jpg"
                alt="Handmade accessories featured collection: floral pouch and fabric scrunchies"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY ROW */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 w-full space-y-6">
        <div className="flex items-end justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <span className="text-label text-[var(--color-text-muted)]">Categories</span>
            <h2 className="text-h2 text-[var(--color-text)] mt-1">Explore by Type</h2>
          </div>
          <NextLink
            href="/shop"
            className="text-body-small font-medium text-[var(--color-primary)] hover:underline underline-offset-4 hidden sm:inline"
          >
            All products
          </NextLink>
        </div>

        {categoriesLoading && (
          <div data-testid="categories-loading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-[4px]" />
                <Skeleton className="h-6 w-32 rounded-[4px]" />
                <Skeleton className="h-4 w-48 rounded-[4px]" />
              </div>
            ))}
          </div>
        )}

        {categoriesError && (
          <ErrorState
            title="Could not load categories"
            message={categoriesError}
            onRetry={loadData}
          />
        )}

        {!categoriesLoading && !categoriesError && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {categories.map((cat) => (
              <NextLink
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col w-full"
              >
                <div className="relative w-full aspect-square rounded-[4px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <Image
                    src={cat.image || '/images/placeholders/scrunchie-1.svg'}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="text-h3 text-[var(--color-text)] font-medium group-hover:underline underline-offset-4">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-body-small text-[var(--color-text-muted)] mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>
              </NextLink>
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 w-full space-y-8">
        <div className="flex items-end justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <span className="text-label text-[var(--color-text-muted)]">Catalogue</span>
            <h2 className="text-h2 text-[var(--color-text)] mt-1">Featured Pieces</h2>
          </div>
          <NextLink
            href="/shop"
            className="text-body-small font-medium text-[var(--color-primary)] hover:underline underline-offset-4 hidden sm:inline"
          >
            View full range
          </NextLink>
        </div>

        <ProductGrid
          products={products}
          isLoading={productsLoading}
          error={productsError}
          onRetry={loadData}
          emptyTitle="No featured products"
          emptyDescription="We are updating our catalogue. Please check back shortly."
        />
      </section>

      {/* 4. BRAND STORY BAND */}
      <section className="w-full bg-[var(--color-surface)] border-y border-[var(--color-border)] py-16 md:py-24">
        <div className="max-w-[960px] mx-auto px-4 sm:px-8 text-center space-y-6">
          <span className="text-label text-[var(--color-text-muted)]">About The Studio</span>
          <h2 className="text-h2 text-[var(--color-text)] font-normal leading-tight">
            Thoughtful accessories made from tactile fabrics. Designed for everyday use.
          </h2>
          <p className="text-body text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
            Every item in our collection begins with carefully chosen textiles: washed corduroy, cotton florals,
            check patterns, and natural linen. We build pieces you can configure with your choice of fabric, size,
            zipper, and finishes.
          </p>
        </div>
      </section>

      {/* 5. BUILD YOUR OWN CTA */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 w-full">
        <div className="p-8 sm:p-12 md:p-16 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[4px] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-label text-[var(--color-text-muted)]">Interactive Customiser</span>
            <h2 className="text-h2 text-[var(--color-text)]">
              Build your own accessory in three simple steps.
            </h2>
            <p className="text-body text-[var(--color-text-muted)]">
              Choose your product, pick your fabric texture and dimensions, and see your price update as you choose before ordering.
            </p>
          </div>
          <div className="shrink-0">
            <NextLink href="/build-your-own">
              <Button variant="primary" size="lg">
                Customise an Item
              </Button>
            </NextLink>
          </div>
        </div>
      </section>
    </div>
  );
}
