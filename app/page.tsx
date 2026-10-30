'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import { productsApi, categoriesApi } from '@/lib/api';
import { ProductSummary, CategorySummary } from '@/lib/types';
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
        data-tone="dark"
        className="section-screen relative w-full bg-[var(--color-plum)] text-[var(--color-ivory)] overflow-hidden"
      >
        <div className="container-custom grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center my-auto">
          {/* Left on desktop: Text Column */}
          <div className="order-1 lg:order-1 lg:col-span-7 flex flex-col items-start gap-3 sm:gap-4 lg:gap-6">
            <div className="inline-flex items-center px-3 py-1 bg-transparent border border-[rgba(251,247,244,0.45)] rounded-[4px]">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-ivory)]">
                Handmade in India
              </span>
            </div>

            <h1 className="font-heading text-[var(--color-ivory)] text-[clamp(2rem,5vw,3.75rem)] leading-[1.1] tracking-tight [text-wrap:balance]">
              Made by hand,{' '}
              <span className="font-script text-[var(--color-rose-light)] font-normal italic block sm:inline">
                made for you.
              </span>
            </h1>

            <p className="text-[rgba(251,247,244,0.82)] text-base leading-[1.6] max-w-xl">
              Pick your fabric, colour and finish. Every
              scrunchie, pouch and sleeve is stitched by hand, just for you.
            </p>

            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 sm:pt-2">
              <NextLink
                href="/shop"
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-[4px] font-medium text-[15px] bg-[var(--color-ivory)] text-[var(--color-plum)] hover:bg-[var(--color-surface)] transition-colors inline-flex items-center justify-center text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)]"
              >
                Explore the Collection
              </NextLink>
              <NextLink
                href="/build-your-own"
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-[4px] font-medium text-[15px] bg-transparent border border-[var(--color-ivory)] text-[var(--color-ivory)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-plum)] transition-colors inline-flex items-center justify-center text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)]"
              >
                Design Your Own
              </NextLink>
            </div>
          </div>

          {/* Right-hand column container: Hero visual slot (to be filled) */}
          <div className="hidden md:flex order-2 lg:order-2 lg:col-span-5 w-full items-center justify-center lg:justify-end">
            {/* Hero visual slot (to be filled) */}
          </div>
        </div>
      </section>

      {/* 2. CATEGORY ROW (EXPLORE BY TYPE) */}
      <section
        id="explore-by-type"
        data-tone="light"
        className="section-screen relative w-full border-b border-[var(--color-line)] bg-[var(--color-ivory)]"
      >
        <div className="container-custom flex flex-col justify-center space-y-6 my-auto">
          <div className="flex items-end justify-between border-b border-[var(--color-line)] pb-3 sm:pb-4">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-rose-text)]">Categories</span>
              <h2 className="text-h2 font-heading text-[var(--color-ink)] mt-1">Explore by Type</h2>
            </div>
            <NextLink
              href="/shop"
              className="text-body-small font-medium text-[var(--color-plum)] underline underline-offset-4 decoration-1 hidden sm:inline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)] rounded-[2px]"
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
                  className="group flex flex-col w-full min-h-[44px] rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)]"
                >
                  {cat.image ? (
                    <div className="relative w-full aspect-4/5 rounded-[4px] overflow-hidden bg-[var(--color-surface)]">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover rounded-[4px]"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-4/5 rounded-[4px] bg-[var(--color-surface)] flex items-center justify-center p-4 select-none">
                      <span className="text-[12px] text-[var(--color-muted)] font-medium text-center">
                        Photo coming soon
                      </span>
                    </div>
                  )}
                  <div className="mt-2.5 sm:mt-3 flex flex-col gap-0.5 sm:gap-1">
                    <h3 className="font-heading text-lg sm:text-xl font-medium text-[var(--color-ink)] [@media(hover:hover)]:group-hover:underline [@media(hover:hover)]:group-hover:decoration-[var(--color-plum)] underline-offset-4 decoration-1 line-clamp-1">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-body-small text-[var(--color-muted)] line-clamp-2">
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
            <NextLink
              href="/shop"
              className="w-full min-h-[48px] px-6 py-3 rounded-[4px] font-medium text-[15px] bg-transparent border border-[var(--color-plum)] text-[var(--color-plum)] [@media(hover:hover)]:hover:bg-[var(--color-plum)] [@media(hover:hover)]:hover:text-[var(--color-ivory)] transition-colors inline-flex items-center justify-center text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)]"
            >
              All products
            </NextLink>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section
        id="featured-pieces"
        data-tone="light"
        className="section-screen relative w-full border-b border-[rgba(61,36,56,0.20)] bg-[var(--color-surface)]"
      >
        <div className="container-custom flex flex-col justify-center space-y-6 my-auto">
          <div className="flex items-end justify-between border-b border-[rgba(61,36,56,0.20)] pb-3 sm:pb-4">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
                Catalogue
              </span>
              <h2 className="text-h2 font-heading text-[var(--color-ink)] mt-1">
                Featured Pieces
              </h2>
            </div>
            <NextLink
              href="/shop"
              className="text-body-small font-medium text-[var(--color-plum)] underline underline-offset-4 decoration-1 hidden sm:inline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)] rounded-[2px]"
            >
              View full range
            </NextLink>
          </div>

          <ProductGrid
            products={products}
            isLoading={productsLoading}
            error={productsError}
            onRetry={loadData}
            tone="on-tint"
            emptyTitle="No featured products"
            emptyDescription="We are updating our catalogue. Please check back shortly."
          />

          {/* Mobile View Full Range Outline Button */}
          <div className="sm:hidden pt-2">
            <NextLink
              href="/shop"
              className="w-full min-h-[48px] px-6 py-3 rounded-[4px] font-medium text-[15px] bg-transparent border border-[var(--color-plum)] text-[var(--color-plum)] [@media(hover:hover)]:hover:bg-[var(--color-plum)] [@media(hover:hover)]:hover:text-[var(--color-ivory)] transition-colors inline-flex items-center justify-center text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)]"
            >
              View full range
            </NextLink>
          </div>
        </div>
      </section>

      {/* 4. ABOUT THE STUDIO / BRAND STORY BAND */}
      <section
        id="about-the-studio"
        data-tone="dark"
        className="w-full bg-[var(--color-surface)] border-y border-[var(--color-border)] py-16 md:py-24"
      >
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

      {/* 5. RATINGS & REVIEWS SECTION */}
      <ReviewsSection />
    </div>
  );
}
