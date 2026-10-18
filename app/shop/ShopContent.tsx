'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi, categoriesApi } from '@/lib/api';
import { ProductSummary, CategorySummary, ProductsResponse } from '@/lib/types';
import {
  ProductGrid,
  SearchInput,
  FilterChips,
  FilterDrawer,
  FilterControls,
  FilterValues,
  PRICE_OPTIONS,
} from '@/components/catalogue';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export const ShopContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state - CONTRACT-GAP (CG-12): newest sort removed, default is empty/featured
  const rawSort = searchParams.get('sort');
  const sortParam: 'price_asc' | 'price_desc' | 'name' | '' =
    rawSort === 'price_asc' || rawSort === 'price_desc' || rawSort === 'name' ? rawSort : '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const fabricParam = searchParams.get('fabric') || '';
  const priceRangeParam = searchParams.get('priceRange') || '';

  const [productsData, setProductsData] = useState<ProductsResponse | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState<boolean>(false);

  // Compute price bounds from range
  const priceRangeObj = useMemo(() => {
    return PRICE_OPTIONS.find((p) => p.id === priceRangeParam);
  }, [priceRangeParam]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      productsApi.getProducts({
        sort: sortParam || undefined,
        page: pageParam,
        pageSize: 12,
        search: searchParam || undefined,
        category: categoryParam || undefined,
        fabric: fabricParam || undefined,
        priceMin: priceRangeObj?.min,
        priceMax: priceRangeObj?.max,
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
  }, [sortParam, pageParam, searchParam, categoryParam, fabricParam, priceRangeObj]);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      productsApi.getProducts({
        sort: sortParam || undefined,
        page: pageParam,
        pageSize: 12,
        search: searchParam || undefined,
        category: categoryParam || undefined,
        fabric: fabricParam || undefined,
        priceMin: priceRangeObj?.min,
        priceMax: priceRangeObj?.max,
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
  }, [sortParam, pageParam, searchParam, categoryParam, fabricParam, priceRangeObj]);

  const updateQuery = useCallback(
    (newParams: {
      sort?: string;
      page?: number;
      search?: string;
      category?: string;
      fabric?: string;
      priceRange?: string;
      resetAll?: boolean;
    }) => {
      if (newParams.resetAll) {
        router.push('/shop');
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (newParams.sort !== undefined) {
        if (!newParams.sort || newParams.sort === 'newest') params.delete('sort');
        else params.set('sort', newParams.sort);
        params.delete('page');
      }

      if (newParams.search !== undefined) {
        if (!newParams.search.trim()) params.delete('search');
        else params.set('search', newParams.search.trim());
        params.delete('page');
      }

      if (newParams.category !== undefined) {
        if (!newParams.category) params.delete('category');
        else params.set('category', newParams.category);
        params.delete('page');
      }

      if (newParams.fabric !== undefined) {
        if (!newParams.fabric) params.delete('fabric');
        else params.set('fabric', newParams.fabric);
        params.delete('page');
      }

      if (newParams.priceRange !== undefined) {
        if (!newParams.priceRange) params.delete('priceRange');
        else params.set('priceRange', newParams.priceRange);
        params.delete('page');
      }

      if (newParams.page !== undefined) {
        if (newParams.page <= 1) params.delete('page');
        else params.set('page', String(newParams.page));
      }

      const qs = params.toString();
      router.push(`/shop${qs ? `?${qs}` : ''}`);
    },
    [router, searchParams]
  );

  const filterValues: FilterValues = useMemo(
    () => ({
      category: categoryParam || undefined,
      fabric: fabricParam || undefined,
      priceRange: priceRangeParam || undefined,
    }),
    [categoryParam, fabricParam, priceRangeParam]
  );

  const handleFilterChange = (newValues: FilterValues) => {
    updateQuery({
      category: newValues.category || '',
      fabric: newValues.fabric || '',
      priceRange: newValues.priceRange || '',
    });
  };

  const handleClearAll = () => {
    updateQuery({ resetAll: true });
  };

  // Active chips construction
  const activeChips = useMemo(() => {
    const list = [];
    if (searchParam) {
      list.push({
        id: 'search',
        label: `Search: "${searchParam}"`,
        onRemove: () => updateQuery({ search: '' }),
      });
    }
    if (categoryParam) {
      const cat = categories.find(
        (c) => c.slug.toLowerCase() === categoryParam.toLowerCase() || c.id === categoryParam
      );
      list.push({
        id: 'category',
        label: `Category: ${cat?.name || categoryParam}`,
        onRemove: () => updateQuery({ category: '' }),
      });
    }
    if (fabricParam) {
      list.push({
        id: 'fabric',
        label: `Fabric: ${fabricParam}`,
        onRemove: () => updateQuery({ fabric: '' }),
      });
    }
    if (priceRangeParam && priceRangeObj) {
      list.push({
        id: 'price',
        label: `Price: ${priceRangeObj.label}`,
        onRemove: () => updateQuery({ priceRange: '' }),
      });
    }
    return list;
  }, [searchParam, categoryParam, fabricParam, priceRangeParam, priceRangeObj, categories, updateQuery]);

  const activeFilterCount = (categoryParam ? 1 : 0) + (fabricParam ? 1 : 0) + (priceRangeParam ? 1 : 0);

  const sortOptions = [
    { value: '', label: 'Featured' },
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

        {/* Category Pills Navigation */}
        <div className="flex items-center flex-wrap gap-2 mt-6">
          <Link
            href="/shop"
            className={`px-3.5 py-1.5 text-body-small font-medium rounded-full transition-colors cursor-pointer select-none ${
              !categoryParam
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] text-[var(--color-text)] border border-[var(--color-border)]'
            }`}
            aria-current={!categoryParam ? 'page' : undefined}
          >
            All Products
          </Link>
          {categories.map((cat) => {
            const isSelected =
              categoryParam.toLowerCase() === cat.slug.toLowerCase() ||
              categoryParam.toLowerCase() === cat.id.toLowerCase();
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`px-3.5 py-1.5 text-body-small font-medium rounded-full border transition-colors cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] text-[var(--color-text)] border-[var(--color-border)]'
                }`}
                aria-current={isSelected ? 'page' : undefined}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="pt-6 pb-2 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex-1">
          <SearchInput
            value={searchParam}
            onChange={(val) => updateQuery({ search: val })}
            placeholder="Search by name, fabric or description..."
          />
        </div>

        <div className="flex items-center gap-3 justify-between md:justify-end">
          {/* Mobile Filter Button */}
          <Button
            variant="secondary"
            onClick={() => setDrawerOpen(true)}
            aria-label={`Open filters drawer${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
            className="lg:hidden flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-full text-[11px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Desktop Filter Toggle Button */}
          <Button
            variant="secondary"
            onClick={() => setDesktopFiltersOpen(!desktopFiltersOpen)}
            aria-expanded={desktopFiltersOpen}
            aria-label={`Toggle filters panel${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
            className="hidden lg:flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-full text-[11px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Sort Select */}
          <div className="w-48 sm:w-56 shrink-0">
            <Select
              label="Sort by"
              options={sortOptions}
              value={sortParam}
              onChange={(e) => updateQuery({ sort: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Desktop Filter Bar (collapsible) */}
      {desktopFiltersOpen && (
        <div
          role="region"
          aria-label="Filter options"
          className="hidden lg:block my-4 p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] transition-all"
        >
          <FilterControls
            categories={categories}
            values={filterValues}
            onChange={handleFilterChange}
            onReset={handleClearAll}
          />
        </div>
      )}

      {/* Active Filter Chips */}
      <FilterChips chips={activeChips} onClearAll={handleClearAll} />

      {/* Status Announcements & Count */}
      <div className="py-3 flex items-center justify-between" aria-live="polite">
        <p className="text-body-small text-[var(--color-text-muted)]">
          {isLoading ? (
            'Loading collection...'
          ) : (
            `Showing ${products.length} of ${total} ${total === 1 ? 'item' : 'items'}`
          )}
        </p>
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={products}
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        headingLevel="h2"
        emptyTitle="No accessories found"
        emptyDescription={
          activeChips.length > 0
            ? 'We could not find any items matching your selected search or filters.'
            : 'There are currently no items available.'
        }
      />

      {/* If empty and has filters, show an explicit Clear Filters CTA */}
      {!isLoading && !error && products.length === 0 && activeChips.length > 0 && (
        <div className="flex justify-center -mt-6 mb-12">
          <Button variant="primary" onClick={handleClearAll}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && totalPages > 1 && (
        <nav
          aria-label="Catalogue pagination"
          className="mt-12 pt-6 border-t border-[var(--color-border)] flex items-center justify-between gap-4"
        >
          <Button
            variant="secondary"
            disabled={currentPage <= 1}
            onClick={() => updateQuery({ page: currentPage - 1 })}
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
            onClick={() => updateQuery({ page: currentPage + 1 })}
            aria-label="Go to next page"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        </nav>
      )}

      {/* Mobile Filters Drawer */}
      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleClearAll}
        activeCount={activeFilterCount}
      />
    </div>
  );
};
