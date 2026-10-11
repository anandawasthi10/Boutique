import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useConfigurator } from '@/lib/hooks/useConfigurator';
import { productsApi } from '@/lib/api';
import { Product, PriceQuote } from '@/lib/types';

describe('FE-17: Configurator state and price quotes', () => {
  const mockProduct: Product = {
    id: 'prod-scrunchie',
    slug: 'classic-scrunchie',
    name: 'Classic Linen Scrunchie',
    basePrice: 249,
    description: 'A handmade linen scrunchie.',
    images: [{ url: '/img/1.svg', alt: 'Scrunchie', order: 1 }],
    category: { id: 'cat-1', name: 'Hair' },
    optionGroups: [
      {
        id: 'grp-fabric',
        label: 'Fabric',
        type: 'swatch',
        required: true,
        defaultOptionId: 'opt-linen',
        options: [
          { id: 'opt-linen', label: 'Linen', priceDelta: 0, available: true },
          { id: 'opt-silk', label: 'Silk', priceDelta: 80, available: false, unavailableReason: 'Sold out' },
          { id: 'opt-velvet', label: 'Velvet', priceDelta: 50, available: true },
        ],
      },
      {
        id: 'grp-size',
        label: 'Size',
        type: 'chips',
        required: true,
        // no defaultOptionId!
        options: [
          { id: 'opt-reg', label: 'Regular', priceDelta: 0, available: true },
          { id: 'opt-lg', label: 'Large', priceDelta: 30, available: true },
        ],
      },
      {
        id: 'grp-tag',
        label: 'Custom Tag',
        type: 'toggle',
        required: false,
        options: [
          { id: 'opt-tag-yes', label: 'Engraved tag', priceDelta: 60, available: true },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no selection is made for a group unless the API supplied a default', () => {
    const { result } = renderHook(() =>
      useConfigurator({ product: mockProduct, debounceMs: 10 })
    );

    // Fabric had defaultOptionId 'opt-linen'
    expect(result.current.selectedOptionIds['grp-fabric']).toBe('opt-linen');

    // Size had no defaultOptionId -> MUST be undefined/empty
    expect(result.current.selectedOptionIds['grp-size']).toBeUndefined();

    // Custom Tag had no default -> MUST be undefined/empty
    expect(result.current.selectedOptionIds['grp-tag']).toBeUndefined();

    // Since size is required and unselected, isComplete is false and missingRequiredGroups has size
    expect(result.current.isComplete).toBe(false);
    expect(result.current.missingRequiredGroups.map((g) => g.id)).toContain('grp-size');
  });

  it('add to cart is not allowed until every required group has a selection and quote is valid', async () => {
    const mockQuoteValid: PriceQuote = {
      valid: true,
      lines: [{ label: 'Base', amount: 249 }],
      total: 249,
    };
    vi.spyOn(productsApi, 'getPriceQuote').mockResolvedValue(mockQuoteValid);

    const { result } = renderHook(() =>
      useConfigurator({ product: mockProduct, debounceMs: 10 })
    );

    // Initial state: size missing, so cannot add to cart
    expect(result.current.canAddToCart).toBe(false);

    // Select size
    act(() => {
      result.current.selectOption('grp-size', 'opt-reg');
    });

    // Wait for debounced quote
    await waitFor(() => {
      expect(result.current.quote).toEqual(mockQuoteValid);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.canAddToCart).toBe(true);
    });
  });

  it('a quote response for an old selection never replaces a newer one (out-of-order protection)', async () => {
    let resolveFirstQuote!: (quote: PriceQuote) => void;
    let resolveSecondQuote!: (quote: PriceQuote) => void;

    const firstPromise = new Promise<PriceQuote>((res) => {
      resolveFirstQuote = res;
    });
    const secondPromise = new Promise<PriceQuote>((res) => {
      resolveSecondQuote = res;
    });

    const getPriceQuoteSpy = vi
      .spyOn(productsApi, 'getPriceQuote')
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { result } = renderHook(() =>
      useConfigurator({ product: mockProduct, debounceMs: 5 })
    );

    // Trigger selection change 1
    act(() => {
      result.current.selectOption('grp-size', 'opt-reg');
    });

    // Wait for first call
    await waitFor(() => {
      expect(getPriceQuoteSpy).toHaveBeenCalledTimes(1);
    });

    // Trigger selection change 2 before first finishes
    act(() => {
      result.current.selectOption('grp-size', 'opt-lg');
    });

    // Wait for second call
    await waitFor(() => {
      expect(getPriceQuoteSpy).toHaveBeenCalledTimes(2);
    });

    // Now resolve second request FIRST with newer data (total 279)
    await act(async () => {
      resolveSecondQuote({
        valid: true,
        lines: [{ label: 'Base', amount: 249 }, { label: 'Large', amount: 30 }],
        total: 279,
      });
    });

    expect(result.current.quote?.total).toBe(279);

    // Now older request finishes late with stale data (total 249)
    await act(async () => {
      resolveFirstQuote({
        valid: true,
        lines: [{ label: 'Base', amount: 249 }],
        total: 249,
      });
    });

    // Stale response must be discarded! Total remains 279
    expect(result.current.quote?.total).toBe(279);
  });

  it('quote failures keep the last valid price marked as outdated and block Add to cart', async () => {
    const validQuote: PriceQuote = {
      valid: true,
      lines: [{ label: 'Base', amount: 249 }],
      total: 249,
    };

    const spy = vi
      .spyOn(productsApi, 'getPriceQuote')
      .mockResolvedValueOnce(validQuote)
      .mockRejectedValueOnce(new Error('Network error on quote calculation'));

    const { result } = renderHook(() =>
      useConfigurator({ product: mockProduct, debounceMs: 10 })
    );

    // Initial load succeeds
    await waitFor(() => {
      expect(result.current.quote).toEqual(validQuote);
      expect(result.current.isQuoteOutdated).toBe(false);
    });

    // Now trigger an action that fails quote calculation
    act(() => {
      result.current.selectOption('grp-fabric', 'opt-velvet');
    });

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(2);
      expect(result.current.quoteError).toBe('Network error on quote calculation');
      // Last valid price is kept
      expect(result.current.quote?.total).toBe(249);
      // Marked as outdated
      expect(result.current.isQuoteOutdated).toBe(true);
      // Add to cart is blocked
      expect(result.current.canAddToCart).toBe(false);
    });
  });

  it('when an option becomes unavailable, its selection is cleared and the customer is notified', async () => {
    vi.spyOn(productsApi, 'getPriceQuote').mockResolvedValue({
      valid: true,
      lines: [{ label: 'Base', amount: 249 }],
      total: 249,
    });

    // Initial state with silk (sold out) in initialSelections
    const { result, rerender } = renderHook(
      ({ prod }) =>
        useConfigurator({
          product: prod,
          initialSelections: { 'grp-fabric': 'opt-silk' },
          debounceMs: 10,
        }),
      { initialProps: { prod: mockProduct } }
    );

    // Silk was unavailable, so it was deselected and notice provided
    expect(result.current.selectedOptionIds['grp-fabric']).toBeUndefined();
    expect(result.current.unavailableNotice).toContain('Silk is currently unavailable');

    // Select velvet (which is available)
    act(() => {
      result.current.selectOption('grp-fabric', 'opt-velvet');
    });
    expect(result.current.selectedOptionIds['grp-fabric']).toBe('opt-velvet');

    // Simulate product updating where velvet now becomes unavailable
    const updatedProduct: Product = {
      ...mockProduct,
      optionGroups: [
        {
          ...mockProduct.optionGroups[0],
          options: [
            { id: 'opt-linen', label: 'Linen', priceDelta: 0, available: true },
            { id: 'opt-silk', label: 'Silk', priceDelta: 80, available: false },
            { id: 'opt-velvet', label: 'Velvet', priceDelta: 50, available: false, unavailableReason: 'Fabric batch damaged' },
          ],
        },
        mockProduct.optionGroups[1],
        mockProduct.optionGroups[2],
      ],
    };

    rerender({ prod: updatedProduct });

    // Velvet should be cleared and notice updated
    await waitFor(() => {
      expect(result.current.selectedOptionIds['grp-fabric']).toBeUndefined();
      expect(result.current.unavailableNotice).toContain('Velvet is currently unavailable');
    });
  });
});
