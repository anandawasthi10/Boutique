'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, notFound } from 'next/navigation';
import { productsApi, categoriesApi } from '@/lib/api';
import { ProductSummary, CategorySummary, ProductsResponse } from '@/lib/types';
import { ProductGrid } from '@/components/catalogue';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CategoryContentProps {
  slug: string;
}

export const CategoryContent: React.FC<CategoryContentProps> = ({ slug }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortParam = (searchParams.get('sort') as 'price_asc' | 'price_desc' | 'name' | 'newest') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [currentCategory, setCurrentCategory] = useState<CategorySummary | null>(null);
  const [allCategories, setAllCategories] = useState<CategorySummary[]>([]);
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCategoryChecked, setIsCategoryChecked] = useState<boolean>(false);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    categoriesApi
      .getCategories()
      .then((catList) => {
        setAllCategories(catList);
        const matchedCat = catList.find(
          (c) => c.slug.toLowerCase() === slug.toLowerCase()
        );

        if (!matchedCat) {
          setIsCategoryChecked(true);
          notFound();
          return;
        }

        setCurrentCategory(matchedCat);
        setIsCategoryChecked(true);

        return productsApi.getProducts({
          category: matchedCat.id,
          sort: sortParam,
          page: pageParam,
          pageSize: 12,
        });
      })
      .then((prodRes) => {
        if (prodRes) {
          setProductsData(prodRes);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (err && typeof err === 'object' && 'digest' in err) {
          throw err;
        }
        const msg = err instanceof Error ? err.message : 'Unable to load products. Please try again.';
        setError(msg);
        setIsLoading(false);
      });
  }, [slug, sortParam, pageParam]);

  useEffect(() => {
    let ignore = false;

    categoriesApi
      .getCategories()
      .then((catList) => {
        if (ignore) return null;
        setAllCategories(catList);
        const matchedCat = catList.find(
          (c) => c.slug.toLowerCase() === slug.toLowerCase()
        );

        if (!matchedCat) {
          setIsCategoryChecked(true);
          notFound();
          return null;
        }

        setCurrentCategory(matchedCat);
        setIsCategoryChecked(true);

        return productsApi.getProducts({
          category: matchedCat.id,
          sort: sortParam,
          page: pageParam,
          pageSize: 12,
        });
      })
      .then((prodRes) => {
        if (!ignore && prodRes) {
          setProductsData(prodRes);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (err && typeof err === 'object' && 'digest' in err) {
          throw err;
        }
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Unable to load products. Please try again.';
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [slug, sortParam, pageParam]);

  const updateQuery = (newParams: { sort?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newParams.sort !== undefined) {
      if (newParams.sort === 'newest') {
        params.delete('sort');
      } else {
        params.set('sort', newParams.sort);
      }
      params.delete('page');
    }
    if (newParams.page !== undefined) {
      if (newParams.page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(newParams.page));
      }
    }

    const queryString = params.toString();
    router.push(`/category/${slug}${queryString ? `?${queryString}` : ''}`);
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

  if (isCategoryChecked && !currentCategory && !isLoading) {
    notFound();
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop All', href: '/shop' },
          { label: currentCategory?.name || slug },
        ]}
      />

      {/* Header & Category Pills */}
      <div className="border-b border-[var(--color-border)] pb-8 pt-4">
        <h1 className="text-h1 font-heading text-[var(--color-text)]">
          {currentCategory?.name || 'Category'}
        </h1>
        {currentCategory?.description && (
          <p className="text-body text-[var(--color-text-muted)] mt-2 max-w-2xl">
            {currentCategory.description}
          </p>
        )}

        {/* Category Pills Navigation */}
        <div className="flex items-center flex-wrap gap-2 mt-6">
          <Link
            href="/shop"
            className="px-3.5 py-1.5 text-body-small font-medium bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] text-[var(--color-text)] rounded-full border border-[var(--color-border)] transition-colors select-none"
          >
            All Products
          </Link>
          {allCategories.map((cat) => {
            const isSelected = cat.slug.toLowerCase() === slug.toLowerCase();
            return isSelected ? (
              <span
                key={cat.id}
                className="px-3.5 py-1.5 text-body-small font-medium bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-full select-none"
                aria-current="page"
              >
                {cat.name}
              </span>
            ) : (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="px-3.5 py-1.5 text-body-small font-medium bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] text-[var(--color-text)] rounded-full border border-[var(--color-border)] transition-colors select-none"
              >
                {cat.name}
              </Link>
            );
          })}
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
        headingLevel="h2"
        emptyTitle={`No ${currentCategory?.name || 'items'} found`}
        emptyDescription="There are currently no items available in this category."
      />

      {/* Pagination Controls */}
      {!isLoading && !error && totalPages > 1 && (
        <nav
          aria-label="Category pagination"
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
