import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComponentPreviewPage from '@/app/component-preview/page';
import * as navigation from 'next/navigation';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('FE-04: Component preview page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders all component sections in development environment', () => {
    vi.stubEnv('NODE_ENV', 'development');
    render(<ComponentPreviewPage />);

    expect(screen.getByRole('heading', { name: /component gallery/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /buttons/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /form inputs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /select, checkbox & radio/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /badges & skeletons/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /overlays & notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /empty & error states/i })).toBeInTheDocument();
  });

  it('triggers notFound() when NODE_ENV is production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    render(<ComponentPreviewPage />);
    expect(navigation.notFound).toHaveBeenCalled();
  });
});
