import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BuildYourOwnContent } from '@/app/build-your-own/BuildYourOwnContent';
import { CartProvider } from '@/lib/hooks/useCart';
import { productsApi } from '@/lib/api';
import { Product, ProductSummary } from '@/lib/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('FE-20: Build Your Own guided entry', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.clearAllMocks();
  });

  const mockProductSummaries: ProductSummary[] = [
    {
      id: 'prod-1',
      slug: 'classic-scrunchie',
      name: 'Classic Scrunchie',
      basePrice: 249,
      images: [{ url: '/img/1.svg', alt: 'Scrunchie', order: 1 }],
      category: { id: 'cat-1', name: 'Hair' },
    },
    {
      id: 'prod-2',
      slug: 'makeup-pouch',
      name: 'Makeup Pouch',
      basePrice: 499,
      images: [{ url: '/img/2.svg', alt: 'Pouch', order: 1 }],
      category: { id: 'cat-2', name: 'Pouches' },
    },
  ];

  const mockFullScrunchie: Product = {
    id: 'prod-1',
    slug: 'classic-scrunchie',
    name: 'Classic Scrunchie',
    basePrice: 249,
    description: 'Bespoke linen scrunchie.',
    images: [{ url: '/img/1.svg', alt: 'Scrunchie', order: 1 }],
    category: { id: 'cat-1', name: 'Hair' },
    optionGroups: [
      {
        id: 'fabric',
        label: 'Fabric',
        type: 'swatch',
        required: true,
        defaultOptionId: 'opt-linen',
        options: [
          { id: 'opt-linen', label: 'Linen', priceDelta: 0, available: true },
          { id: 'opt-silk', label: 'Silk', priceDelta: 50, available: true },
        ],
      },
    ],
  };

  const mockFullPouch: Product = {
    id: 'prod-2',
    slug: 'makeup-pouch',
    name: 'Makeup Pouch',
    basePrice: 499,
    description: 'Bespoke makeup pouch.',
    images: [{ url: '/img/2.svg', alt: 'Pouch', order: 1 }],
    category: { id: 'cat-2', name: 'Pouches' },
    optionGroups: [
      {
        id: 'lining',
        label: 'Lining Material',
        type: 'chips',
        required: true,
        options: [
          { id: 'opt-cotton', label: 'Cotton', priceDelta: 0, available: true },
          { id: 'opt-waterproof', label: 'Waterproof', priceDelta: 80, available: true },
        ],
      },
    ],
  };

  it('picker shows only products returned from the API layer', async () => {
    vi.spyOn(productsApi, 'getProducts').mockResolvedValue({
      items: mockProductSummaries,
      total: 2,
      page: 1,
      pageSize: 12,
      totalPages: 1,
    });

    render(
      <CartProvider>
        <BuildYourOwnContent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Classic Scrunchie')).toBeInTheDocument();
      expect(screen.getByText('Makeup Pouch')).toBeInTheDocument();
      expect(screen.getByText('From ₹249')).toBeInTheDocument();
      expect(screen.getByText('From ₹499')).toBeInTheDocument();
    });
  });

  it(
    'choosing a product shows the same configurator and changing product resets selections',
    async () => {
    vi.spyOn(productsApi, 'getProducts').mockResolvedValue({
      items: mockProductSummaries,
      total: 2,
      page: 1,
      pageSize: 12,
      totalPages: 1,
    });

    const getBySlugSpy = vi.spyOn(productsApi, 'getProductBySlug').mockImplementation(async (slug) => {
      if (slug === 'classic-scrunchie') return mockFullScrunchie;
      if (slug === 'makeup-pouch') return mockFullPouch;
      throw new Error('Not found');
    });

    render(
      <CartProvider>
        <BuildYourOwnContent />
      </CartProvider>
    );

    // 1. Click on Classic Scrunchie in the picker
    await waitFor(() => {
      expect(screen.getByTestId('picker-item-classic-scrunchie')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('picker-item-classic-scrunchie'));

    // Configurator opens for Scrunchie
    await waitFor(() => {
      expect(getBySlugSpy).toHaveBeenCalledWith('classic-scrunchie');
      expect(screen.getByTestId('product-configurator')).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /linen/i })).toBeInTheDocument();
    });

    // 2. Change product back to picker and select Makeup Pouch
    const changeProductButton = screen.getByRole('button', {
      name: /choose different piece/i,
    });
    fireEvent.click(changeProductButton);

    // Returns to picker
    await waitFor(() => {
      expect(screen.getByTestId('product-picker-section')).toBeInTheDocument();
    });

    // Choose Makeup Pouch
    fireEvent.click(screen.getByTestId('picker-item-makeup-pouch'));

    // Configurator opens for Makeup Pouch with reset selections
    await waitFor(() => {
      expect(getBySlugSpy).toHaveBeenCalledWith('makeup-pouch');
      expect(screen.getByTestId('product-configurator')).toBeInTheDocument();
      // Pouch has lining option groups, not fabric!
      expect(screen.getByRole('radio', { name: /cotton/i })).toBeInTheDocument();
      expect(screen.queryByRole('radio', { name: /linen/i })).not.toBeInTheDocument();
    });
  }, 15000);

  it('renders error state when API fails', async () => {
    vi.spyOn(productsApi, 'getProducts').mockRejectedValueOnce(
      new Error('API database connection failed')
    );

    render(
      <CartProvider>
        <BuildYourOwnContent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Could not load studio pieces')).toBeInTheDocument();
      expect(screen.getByText('API database connection failed')).toBeInTheDocument();
    });
  });

  it('renders empty state when no products return from API', async () => {
    vi.spyOn(productsApi, 'getProducts').mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 0,
    });

    render(
      <CartProvider>
        <BuildYourOwnContent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No accessories available')).toBeInTheDocument();
    });
  });
});
