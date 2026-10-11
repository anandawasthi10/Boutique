import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ShopContent } from '@/app/shop/ShopContent';
import { CategoryContent } from '@/app/category/[slug]/CategoryContent';
import { productsApi } from '@/lib/api';
import * as navigation from 'next/navigation';

describe('FE-12: Shop All and category pages', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.clearAllMocks();
  });

  describe('Shop All page (/shop)', () => {
    it('loads products and categories through API layer and renders breadcrumbs and grid', async () => {
      render(<ShopContent />);

      // Breadcrumb
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Shop All')).toBeInTheDocument();

      // Heading
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/all accessories/i);

      // Skeletons during loading then products
      await waitFor(() => {
        expect(screen.getByText('Classic Scrunchie')).toBeInTheDocument();
        expect(screen.getByText('Everyday Makeup Pouch')).toBeInTheDocument();
      });

      // Categories should render as links
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Scrunchies' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Pouches' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Sleeves' })).toBeInTheDocument();
      });
    });

    it('renders error state with retry button when products API fails', async () => {
      vi.spyOn(productsApi, 'getProducts').mockRejectedValueOnce(new Error('Network failure loading shop'));

      render(<ShopContent />);

      await waitFor(() => {
        expect(screen.getByTestId('product-grid-error')).toBeInTheDocument();
        expect(screen.getByText(/network failure loading shop/i)).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /try again/i });
      expect(retryBtn).toBeInTheDocument();
    });

    it('renders empty state when no products return', async () => {
      vi.spyOn(productsApi, 'getProducts').mockResolvedValueOnce({
        items: [],
        total: 0,
        page: 1,
        pageSize: 12,
        totalPages: 1,
      });

      render(<ShopContent />);

      await waitFor(() => {
        expect(screen.getByTestId('product-grid-empty')).toBeInTheDocument();
        expect(screen.getByText(/no accessories found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Category page (/category/[slug])', () => {
    it('loads matching category and products, reflecting category in title and breadcrumbs', async () => {
      render(<CategoryContent slug="scrunchies" />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Scrunchies');
      });

      // Breadcrumbs reflects category name
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Shop All' })).toBeInTheDocument();

      // Products in this category
      await waitFor(() => {
        expect(screen.getByText('Classic Scrunchie')).toBeInTheDocument();
      });
    });

    it('triggers notFound() when an unknown category slug is visited', async () => {
      render(<CategoryContent slug="unknown-non-existent-category" />);

      await waitFor(() => {
        expect(navigation.notFound).toHaveBeenCalled();
      });
    });

    it('allows changing sorting and updates url query parameter', async () => {
      render(<ShopContent />);

      await waitFor(() => {
        expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/sort by/i);
      fireEvent.change(select, { target: { value: 'price_asc' } });
    });
  });
});
