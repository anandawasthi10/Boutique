import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotFound from '@/app/not-found';
import GlobalError from '@/app/error';
import GlobalLoading from '@/app/loading';
import { SITE_CONFIG } from '@/lib/config/site';

describe('R-09: Missing pages and centralized metadata', () => {
  describe('Not Found Page (404)', () => {
    it('renders branded 404 page with friendly wording and navigation links', () => {
      render(<NotFound />);

      const heading = screen.getByRole('heading', { level: 1, name: /page not found/i });
      expect(heading).toBeInTheDocument();

      expect(
        screen.getByText(/we couldn't find the page or accessory you were looking for/i)
      ).toBeInTheDocument();

      const shopLink = screen.getByRole('link', { name: /shop all/i });
      expect(shopLink).toHaveAttribute('href', '/shop');

      const homeLink = screen.getByRole('link', { name: /return home/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Global Error Boundary', () => {
    it('renders friendly general apology without leaking stack trace or technical details', () => {
      const resetMock = vi.fn();
      const testError = new Error('Sensitive database connection string: postgres://user:pass@db:5432');

      render(<GlobalError error={testError} reset={resetMock} />);

      const heading = screen.getByRole('heading', { level: 1, name: /something went wrong/i });
      expect(heading).toBeInTheDocument();

      // Ensure friendly general wording is displayed
      expect(
        screen.getByText(/we're sorry, an unexpected error occurred while loading this page/i)
      ).toBeInTheDocument();

      // Ensure technical error details or sensitive strings are NOT exposed
      expect(screen.queryByText(/postgres:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/connection string/i)).not.toBeInTheDocument();

      // Try Again button calls reset
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);
      expect(resetMock).toHaveBeenCalledTimes(1);

      // Return home link
      const homeLink = screen.getByRole('link', { name: /return home/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Global Loading State', () => {
    it('renders accessible loading skeletons and screen reader announcement', () => {
      render(<GlobalLoading />);

      const loadingContainer = screen.getByRole('status', { name: /loading page/i });
      expect(loadingContainer).toBeInTheDocument();
      expect(loadingContainer).toHaveAttribute('aria-busy', 'true');

      expect(
        screen.getByText(/loading page content, please wait\.\.\./i)
      ).toBeInTheDocument();
    });
  });

  describe('Centralized Site Metadata', () => {
    it('defines title, description, and icon from central configuration using placeholder text', () => {
      expect(SITE_CONFIG.metadata).toBeDefined();
      expect(SITE_CONFIG.metadata.title).toContain('Brand Name');
      expect(SITE_CONFIG.metadata.description).toBeTruthy();
      expect(SITE_CONFIG.metadata.icons.icon).toBeTruthy();
    });
  });
});
