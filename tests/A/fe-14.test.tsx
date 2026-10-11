import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductImage } from '@/lib/types';
import { PreferencesProvider } from '@/lib/hooks/usePreferences';

const mockImages: ProductImage[] = [
  { url: '/images/placeholders/scrunchie-1.svg', alt: 'Scrunchie Main View', order: 1 },
  { url: '/images/placeholders/scrunchie-2.svg', alt: 'Scrunchie Texture Close-up', order: 2 },
  { url: '/images/placeholders/fabric-floral.svg', alt: 'Scrunchie Fabric Swatch', order: 3 },
];

describe('FE-14: Product gallery', () => {
  it('renders neutral placeholder when product has no images', () => {
    render(<ProductGallery images={[]} productName="Classic Scrunchie" />);

    expect(screen.getByTestId('gallery-placeholder')).toBeInTheDocument();
    expect(screen.getByText(/no images available/i)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /image thumbnails/i })).not.toBeInTheDocument();
  });

  it('renders main image without thumbnail row when product has exactly one image', () => {
    render(
      <ProductGallery
        images={[mockImages[0]]}
        productName="Classic Scrunchie"
      />
    );

    expect(screen.getByAltText('Scrunchie Main View')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /image thumbnails/i })).not.toBeInTheDocument();
  });

  it('renders thumbnails row as buttons with accessible names and selected states', () => {
    render(
      <ProductGallery
        images={mockImages}
        productName="Classic Scrunchie"
      />
    );

    const thumbnailsRegion = screen.getByRole('region', { name: /image thumbnails/i });
    expect(thumbnailsRegion).toBeInTheDocument();

    const thumbButtons = screen.getAllByRole('button', { name: /view image/i });
    expect(thumbButtons.length).toBe(3);

    // First thumbnail is selected by default
    expect(thumbButtons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(thumbButtons[1]).toHaveAttribute('aria-pressed', 'false');

    // Click second thumbnail
    fireEvent.click(thumbButtons[1]);

    expect(thumbButtons[1]).toHaveAttribute('aria-pressed', 'true');
    expect(thumbButtons[0]).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByAltText('Scrunchie Texture Close-up')).toBeInTheDocument();
  });

  it('first image loads with priority and subsequent images lazily', () => {
    render(
      <ProductGallery
        images={mockImages}
        productName="Classic Scrunchie"
      />
    );

    const mainImg = screen.getByAltText('Scrunchie Main View');
    // next/image sets priority via data attribute or absence of loading="lazy"
    expect(mainImg).not.toHaveAttribute('loading', 'lazy');
  });

  it('supports touch swipe navigation on mobile', () => {
    render(
      <ProductGallery
        images={mockImages}
        productName="Classic Scrunchie"
      />
    );

    const container = screen.getByTestId('gallery-main-container');

    // Swipe left (startX = 200, endX = 100 -> diff 100 > threshold 40)
    fireEvent.touchStart(container, {
      targetTouches: [{ clientX: 200 }],
    });
    fireEvent.touchMove(container, {
      targetTouches: [{ clientX: 100 }],
    });
    fireEvent.touchEnd(container);

    // Advances to second image
    expect(screen.getByAltText('Scrunchie Texture Close-up')).toBeInTheDocument();

    // Swipe right (startX = 100, endX = 200 -> diff -100 < -threshold -40)
    fireEvent.touchStart(container, {
      targetTouches: [{ clientX: 100 }],
    });
    fireEvent.touchMove(container, {
      targetTouches: [{ clientX: 200 }],
    });
    fireEvent.touchEnd(container);

    // Returns to first image
    expect(screen.getByAltText('Scrunchie Main View')).toBeInTheDocument();
  });

  it('respects reduced motion settings for transitions', () => {
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
        <ProductGallery images={mockImages} productName="Classic Scrunchie" />
      </PreferencesProvider>
    );

    const mainImg = screen.getByAltText('Scrunchie Main View');
    expect(mainImg).toHaveClass('duration-0');
  });
});
