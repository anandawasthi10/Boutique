import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';
import { productsApi } from '@/lib/api';

describe('FE-09: Homepage', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
  });

  it('renders editorial hero with call to actions', async () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/made by hand/i);
    expect(screen.getByRole('link', { name: /explore the collection/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /design your own/i })).toBeInTheDocument();
  });

  it('loads and displays categories and featured products from the API layer', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Scrunchies')).toBeInTheDocument();
      expect(screen.getByText('Pouches')).toBeInTheDocument();
      expect(screen.getByText('Sleeves')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Classic Scrunchie')).toBeInTheDocument();
      expect(screen.getByText('Everyday Makeup Pouch')).toBeInTheDocument();
    });
  });

  it('handles error state gracefully if API fails', async () => {
    vi.spyOn(productsApi, 'getProducts').mockRejectedValueOnce(new Error('Network error'));
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/could not load products/i)).toBeInTheDocument();
    });
  });

  it('renders authentic brand story band without invented claims', () => {
    render(<HomePage />);
    expect(screen.getByText(/thoughtful accessories made from tactile fabrics/i)).toBeInTheDocument();
  });
});
