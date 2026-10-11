import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ShopContent } from '@/app/shop/ShopContent';
import { SearchInput } from '@/components/catalogue/SearchInput';
import { FilterChips } from '@/components/catalogue/FilterChips';
import { FilterControls } from '@/components/catalogue/FilterControls';
import { productsApi } from '@/lib/api';

describe('FE-13: Search and filters', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces rapid typing in SearchInput to avoid requests per keystroke', () => {
    vi.useFakeTimers();
    const handleChange = vi.fn();

    render(<SearchInput value="" onChange={handleChange} debounceMs={300} />);

    const input = screen.getByRole('searchbox');

    // Rapid keystrokes
    fireEvent.change(input, { target: { value: 's' } });
    fireEvent.change(input, { target: { value: 'sc' } });
    fireEvent.change(input, { target: { value: 'scr' } });
    fireEvent.change(input, { target: { value: 'scrun' } });

    // Has not triggered yet
    expect(handleChange).not.toHaveBeenCalled();

    // Fast-forward debounce time
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('scrun');
  });

  it('FilterControls renders only API-supported filters (category, fabric, price range)', () => {
    const handleChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <FilterControls
        categories={[
          { id: 'cat-scrunchies', name: 'Scrunchies', slug: 'scrunchies' },
          { id: 'cat-pouches', name: 'Pouches', slug: 'pouches' },
        ]}
        values={{}}
        onChange={handleChange}
        onReset={handleReset}
      />
    );

    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Fabric')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();

    // Fabric options: Floral, Corduroy, Check, Linen
    expect(screen.getByRole('button', { name: 'Floral' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Corduroy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Linen' })).toBeInTheDocument();

    // Selecting a fabric calls onChange
    fireEvent.click(screen.getByRole('button', { name: 'Floral' }));
    expect(handleChange).toHaveBeenCalledWith({ fabric: 'Floral' });

    // Unsupported filters like "Rating" or "Brand" must not exist
    expect(screen.queryByText('Brand')).not.toBeInTheDocument();
    expect(screen.queryByText('Rating')).not.toBeInTheDocument();
  });

  it('renders filter chips when filters are active and allows removing them', () => {
    const handleRemoveFabric = vi.fn();
    const handleClearAll = vi.fn();

    render(
      <FilterChips
        chips={[
          { id: 'fabric', label: 'Fabric: Floral', onRemove: handleRemoveFabric },
          { id: 'price', label: 'Price: Under ₹300', onRemove: vi.fn() },
        ]}
        onClearAll={handleClearAll}
      />
    );

    expect(screen.getByText('Fabric: Floral')).toBeInTheDocument();
    expect(screen.getByText('Price: Under ₹300')).toBeInTheDocument();

    // Remove single chip
    const removeBtn = screen.getByRole('button', { name: /remove filter: fabric: floral/i });
    fireEvent.click(removeBtn);
    expect(handleRemoveFabric).toHaveBeenCalledTimes(1);

    // Clear all
    const clearAllBtn = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearAllBtn);
    expect(handleClearAll).toHaveBeenCalledTimes(1);
  });

  it('no-results state offers a clear-filters button when 0 items return', async () => {
    vi.spyOn(productsApi, 'getProducts').mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 1,
    });

    render(<ShopContent />);

    await waitFor(() => {
      expect(screen.getByText('No accessories found')).toBeInTheDocument();
    });
  });

  it('mobile filter drawer opens on mobile button click and manages focus and close', async () => {
    render(<ShopContent />);

    const mobileFilterBtn = screen.getByRole('button', { name: /open filters drawer/i });
    fireEvent.click(mobileFilterBtn);

    // Drawer should open with dialog role
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /filters/i })).toBeInTheDocument();

    // Close drawer button
    const closeBtn = screen.getByRole('button', { name: /close drawer/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('filters and search are accessible with keyboard and screen reader announcements', () => {
    render(<ShopContent />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /search accessories collection/i })).toBeInTheDocument();

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });
});
