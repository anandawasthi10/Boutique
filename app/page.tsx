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
import { ReviewsSection } from '@/components/reviews';

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
      <section
        id="hero"
        className="section-screen relative w-full border-b border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden"
      >
        <div className="container-custom py-4 sm:py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center my-auto">
          {/* Top on mobile, right on desktop: Hero Image */}
          <div className="order-1 lg:order-2 lg:col-span-5 w-full flex items-center justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none h-[32svh] sm:h-[38svh] lg:h-auto lg:aspect-4/5 max-h-[42svh] lg:max-h-[calc(100svh-var(--header-h)-4rem)] rounded-[4px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
              <Image
                src="/images/productimages/pouch-and-scrunchies.jpg"
                alt="Handmade accessories featured collection: floral pouch and fabric scrunchies"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Bottom on mobile, left on desktop: Text Column */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col items-start gap-3 sm:gap-4 lg:gap-6">
            <div className="inline-flex items-center px-2.5 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px]">
              <span className="text-label text-[var(--color-text)]">Handmade Accessories</span>
            </div>

            <h1 className="text-display text-[var(--color-text)] tracking-tight">
              Crafted in fabric, <span className="text-script block sm:inline font-normal text-[var(--color-text-muted)]">tailored by you.</span>
            </h1>

            <p className="text-body text-[var(--color-text-muted)] max-w-xl text-sm sm:text-base leading-relaxed">
              Choose your fabric, size, and finishes for hair ties, everyday pouches, and tech sleeves.
              Made by hand with tactile materials, designed to last.
            </p>

            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 sm:pt-2">
              <NextLink href="/shop" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full min-h-[44px]">
                  Shop All Collection
                </Button>
              </NextLink>
              <NextLink href="/build-your-own" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full min-h-[44px]">
                  Build Your Own
                </Button>
              </NextLink>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY ROW (EXPLORE BY TYPE) */}
      <section
        id="explore-by-type"
        className="section-screen relative w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="container-custom flex flex-col justify-center space-y-6 my-auto">
          <div className="flex items-end justify-between border-b border-[var(--color-border)] pb-3 sm:pb-4">
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
            <div data-testid="categories-loading" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2 sm:space-y-3">
                  <Skeleton className="aspect-4/5 w-full rounded-[4px]" />
                  <Skeleton className="h-5 sm:h-6 w-24 sm:w-32 rounded-[4px]" />
                  <Skeleton className="h-3 sm:h-4 w-36 sm:w-48 rounded-[4px]" />
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 items-start">
              {categories.map((cat) => (
                <NextLink
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group flex flex-col w-full min-h-[44px]"
                >
                  <div className="relative w-full aspect-4/5 rounded-[4px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <Image
                      src={cat.image || '/images/placeholders/scrunchie-1.svg'}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="mt-2.5 sm:mt-3 flex flex-col gap-0.5 sm:gap-1">
                    <h3 className="text-h3 text-[var(--color-text)] font-medium group-hover:underline underline-offset-4 line-clamp-1">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-body-small text-[var(--color-text-muted)] line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </NextLink>
              ))}
            </div>
          )}

          {/* Mobile All Products Outline Button */}
          <div className="sm:hidden pt-2">
            <NextLink href="/shop" className="w-full block">
              <Button variant="secondary" className="w-full min-h-[44px]">
                All products
              </Button>
            </NextLink>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section
        id="featured-pieces"
        className="section-screen relative w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="container-custom flex flex-col justify-center space-y-6 my-auto">
          <div className="flex items-end justify-between border-b border-[var(--color-border)] pb-3 sm:pb-4">
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

          {/* Mobile View Full Range Outline Button */}
          <div className="sm:hidden pt-2">
            <NextLink href="/shop" className="w-full block">
              <Button variant="secondary" className="w-full min-h-[44px]">
                View full range
              </Button>
            </NextLink>
          </div>
        </div>
      </section>
 
      {/* 4. RATINGS & REVIEWS SECTION */}
      <ReviewsSection />
 
      {/* 5. BRAND STORY BAND */}
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
