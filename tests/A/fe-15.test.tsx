import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProductDetailContent } from '@/app/product/[slug]/ProductDetailContent';
import { productsApi } from '@/lib/api';
import { ApiException } from '@/lib/api/client';
import * as navigation from 'next/navigation';

describe('FE-15: Product detail page shell', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.clearAllMocks();
  });

  it('renders product details, plain text description, starting price and configurator slot', async () => {
    render(
      <ProductDetailContent
        slug="classic-scrunchie"
        configuratorSlot={<div data-testid="test-configurator">Configurator Component</div>}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Classic Scrunchie');
    });

    // Starting price
    expect(screen.getByText(/from ₹249/i)).toBeInTheDocument();

    // Plain text description
    expect(
      screen.getByText(/a softly gathered fabric scrunchie designed to hold hair comfortably/i)
    ).toBeInTheDocument();

    // Configurator slot
    expect(screen.getByTestId('test-configurator')).toBeInTheDocument();

    // Gallery is rendered
    expect(screen.getByTestId('product-gallery')).toBeInTheDocument();
  });

  it('implements two-column layout on desktop with sticky purchase column', async () => {
    render(<ProductDetailContent slug="classic-scrunchie" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    const stickyContainer = screen.getByTestId('configurator-slot').parentElement;
    expect(stickyContainer).toHaveClass('lg:sticky');
    expect(stickyContainer).toHaveClass('lg:top-28');
  });

  it('triggers notFound() when an unknown product slug is requested', async () => {
    vi.spyOn(productsApi, 'getProductBySlug').mockRejectedValueOnce(
      new ApiException({ code: 'PRODUCT_NOT_FOUND', message: 'Not found' })
    );

    render(<ProductDetailContent slug="non-existent-product" />);

    await waitFor(() => {
      expect(navigation.notFound).toHaveBeenCalled();
    });
  });

  it('renders error state with retry button when API load fails', async () => {
    vi.spyOn(productsApi, 'getProductBySlug').mockRejectedValueOnce(
      new ApiException({ code: 'PRODUCT_LOAD_FAILED', message: 'Database connection failed' })
    );

    render(<ProductDetailContent slug="error-fail-to-load" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/database connection failed/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /try again/i });
    expect(retryBtn).toBeInTheDocument();
  });

  it('renders product name heading to reflect the product on page', async () => {
    render(<ProductDetailContent slug="classic-scrunchie" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Classic Scrunchie');
    });
  });
});

