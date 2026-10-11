import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard, ProductGrid } from '@/components/catalogue';
import { ProductSummary } from '@/lib/types';
import { PreferencesProvider } from '@/lib/hooks/usePreferences';

const sampleProduct: ProductSummary = {
  id: 'prod-scrunchie',
  slug: 'classic-scrunchie',
  name: 'Classic Scrunchie',
  basePrice: 249,
  category: { id: 'cat-scrunchies', name: 'Scrunchies' },
  images: [
    { url: '/images/placeholders/scrunchie-1.svg', alt: 'Classic Scrunchie in floral print', order: 1 },
    { url: '/images/placeholders/scrunchie-2.svg', alt: 'Classic Scrunchie alternate angle', order: 2 },
  ],
};

const sampleProductNoImages: ProductSummary = {
  id: 'prod-no-img',
  slug: 'no-image-pouch',
  name: 'Sample Pouch',
  basePrice: 599,
  category: { id: 'cat-pouches', name: 'Pouches' },
  images: [],
};

describe('FE-11: Product card and grid', () => {
  it('renders single link with accessible name containing name and price without calculation', () => {
    render(<ProductCard product={sampleProduct} />);

    const link = screen.getByRole('link', {
      name: /classic scrunchie, starting from ₹249/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/product/classic-scrunchie');

    expect(screen.getByText('Classic Scrunchie')).toBeInTheDocument();
    expect(screen.getByText('From ₹249')).toBeInTheDocument();
  });

  it('renders neutral placeholder block when product has missing images', () => {
    render(<ProductCard product={sampleProductNoImages} />);

    const placeholder = screen.getByTestId('missing-image-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(screen.getByText(/image coming soon/i)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('provides keyboard focus equivalent for hover state', () => {
    render(<ProductCard product={sampleProduct} />);

    const link = screen.getByRole('link');
    const mainImg = screen.getByAltText('Classic Scrunchie in floral print');
    const secondaryImg = screen.getByAltText('Classic Scrunchie alternate angle');

    expect(mainImg).toHaveClass('opacity-100');
    expect(secondaryImg).toHaveClass('opacity-0');

    // Simulate focus
    fireEvent.focus(link);
    expect(mainImg).toHaveClass('opacity-0');
    expect(secondaryImg).toHaveClass('opacity-100');

    // Simulate blur
    fireEvent.blur(link);
    expect(mainImg).toHaveClass('opacity-100');
    expect(secondaryImg).toHaveClass('opacity-0');
  });

  it('respects reduced motion setting', () => {
    // Mock reduced motion
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <PreferencesProvider>
        <ProductCard product={sampleProduct} />
      </PreferencesProvider>
    );

    const mainImg = screen.getByAltText('Classic Scrunchie in floral print');
    expect(mainImg).toHaveClass('duration-0');
  });

  it('renders product grid with 2 cols mobile, 3 cols tablet, 4 cols desktop', () => {
    render(<ProductGrid products={[sampleProduct, sampleProductNoImages]} />);

    const grid = screen.getByTestId('product-grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('md:grid-cols-3');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('renders skeleton variant when isLoading is true', () => {
    render(<ProductGrid isLoading={true} skeletonCount={6} />);

    const skeletonGrid = screen.getByTestId('product-grid-skeleton');
    expect(skeletonGrid).toBeInTheDocument();
    expect(skeletonGrid.children.length).toBe(6);
  });

  it('renders empty variant when products array is empty', () => {
    render(<ProductGrid products={[]} emptyTitle="Nothing here" />);

    const empty = screen.getByTestId('product-grid-empty');
    expect(empty).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders error variant with retry button when error occurs', () => {
    const handleRetry = vi.fn();
    render(<ProductGrid error="Failed to fetch products" onRetry={handleRetry} />);

    const errorContainer = screen.getByTestId('product-grid-error');
    expect(errorContainer).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch products')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
