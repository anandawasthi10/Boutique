'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi, categoriesApi } from '@/lib/api';
import { ProductSummary, CategorySummary, ProductsResponse } from '@/lib/types';
import { ProductGrid } from '@/components/catalogue';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ShopContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortParam = (searchParams.get('sort') as 'price_asc' | 'price_desc' | 'name' | 'newest') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [productsData, setProductsData] = useState<ProductsResponse | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      productsApi.getProducts({
        sort: sortParam,
        page: pageParam,
        pageSize: 12,
      }),
      categoriesApi.getCategories().catch(() => []),
    ])
      .then(([prodRes, catRes]) => {
        setProductsData(prodRes);
        setCategories(catRes);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unable to load products. Please try again.';
        setError(msg);
        setIsLoading(false);
      });
  }, [sortParam, pageParam]);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      productsApi.getProducts({
        sort: sortParam,
        page: pageParam,
        pageSize: 12,
      }),
      categoriesApi.getCategories().catch(() => []),
    ])
      .then(([prodRes, catRes]) => {
        if (!ignore) {
          setProductsData(prodRes);
          setCategories(catRes);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Unable to load products. Please try again.';
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [sortParam, pageParam]);

  const updateQuery = (newParams: { sort?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newParams.sort !== undefined) {
      if (newParams.sort === 'newest') {
        params.delete('sort');
      } else {
        params.set('sort', newParams.sort);
      }
      params.delete('page'); // Reset page when sort changes
    }
    if (newParams.page !== undefined) {
      if (newParams.page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(newParams.page));
      }
    }

    const queryString = params.toString();
    router.push(`/shop${queryString ? `?${queryString}` : ''}`);
  };

  const handleSortChange = (newSort: string) => {
    updateQuery({ sort: newSort });
  };

  const handlePageChange = (newPage: number) => {
    updateQuery({ page: newPage });
  };

  const sortOptions = [
    { value: 'newest', label: 'Featured & Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  const products: ProductSummary[] = productsData?.items || [];
  const total = productsData?.total ?? 0;
  const totalPages = productsData?.totalPages ?? 1;
  const currentPage = productsData?.page ?? pageParam;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop All' },
        ]}
      />

      {/* Header & Category Tabs */}
      <div className="border-b border-[var(--color-border)] pb-8 pt-4">
        <h1 className="text-h1 font-heading text-[var(--color-text)]">All Accessories</h1>
        <p className="text-body text-[var(--color-text-muted)] mt-2 max-w-2xl">
          Explore our collection of handcrafted fabric accessories, cut and assembled with tactile materials.
        </p>

        {/* Category Filter Pills */}
        <div className="flex items-center flex-wrap gap-2 mt-6">
          <span
            className="px-3.5 py-1.5 text-body-small font-medium bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-full select-none"
            aria-current="page"
          >
            All Products
          </span>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="px-3.5 py-1.5 text-body-small font-medium bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] text-[var(--color-text)] rounded-full border border-[var(--color-border)] transition-colors select-none"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Toolbar: Count & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
        <p className="text-body-small text-[var(--color-text-muted)]">
          {isLoading ? (
            'Loading collection...'
          ) : (
            `Showing ${products.length} of ${total} ${total === 1 ? 'item' : 'items'}`
          )}
        </p>

        <div className="w-full sm:w-60">
          <Select
            label="Sort by"
            options={sortOptions}
            value={sortParam}
            onChange={(e) => handleSortChange(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={products}
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No accessories found"
        emptyDescription="We could not find any items matching your selected criteria."
      />

      {/* Pagination Controls */}
      {!isLoading && !error && totalPages > 1 && (
        <nav
          aria-label="Catalogue pagination"
          className="mt-12 pt-6 border-t border-[var(--color-border)] flex items-center justify-between gap-4"
        >
          <Button
            variant="secondary"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Previous
          </Button>

          <span className="text-body-small font-medium text-[var(--color-text)]">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="secondary"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Go to next page"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        </nav>
      )}
    </div>
  );
};
