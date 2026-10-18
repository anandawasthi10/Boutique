import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalError from '@/app/error';
import ShopError from '@/app/shop/error';
import ProductError from '@/app/product/[slug]/error';
import CheckoutError from '@/app/checkout/error';

describe('TASK 12: Route error pages', () => {
  const mockError = new Error('Simulated route load failure');

  it('renders root GlobalError with retry action and Return Home link', () => {
    const reset = vi.fn();
    render(<GlobalError error={mockError} reset={reset} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Something went wrong');

    const tryAgainBtn = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainBtn).toBeInTheDocument();
    fireEvent.click(tryAgainBtn);
    expect(reset).toHaveBeenCalledTimes(1);

    const homeLink = screen.getByRole('link', { name: /return home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders ShopError reusing root error component with link back to /shop', () => {
    const reset = vi.fn();
    render(<ShopError error={mockError} reset={reset} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Unable to load catalogue');

    const tryAgainBtn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainBtn);
    expect(reset).toHaveBeenCalledTimes(1);

    const shopLink = screen.getByRole('link', { name: /back to shop/i });
    expect(shopLink).toHaveAttribute('href', '/shop');
  });

  it('renders ProductError reusing root error component with link back to /shop', () => {
    const reset = vi.fn();
    render(<ProductError error={mockError} reset={reset} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Unable to load product');

    const tryAgainBtn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainBtn);
    expect(reset).toHaveBeenCalledTimes(1);

    const shopLink = screen.getByRole('link', { name: /back to shop/i });
    expect(shopLink).toHaveAttribute('href', '/shop');
  });

  it('renders CheckoutError reusing root error component with link back to /shop', () => {
    const reset = vi.fn();
    render(<CheckoutError error={mockError} reset={reset} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Checkout error');

    const tryAgainBtn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainBtn);
    expect(reset).toHaveBeenCalledTimes(1);

    const shopLink = screen.getByRole('link', { name: /return to shop/i });
    expect(shopLink).toHaveAttribute('href', '/shop');
  });
});
