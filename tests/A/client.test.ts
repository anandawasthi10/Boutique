import { describe, it, expect, vi } from 'vitest';
import { buildRequestUrl, apiFetch } from '@/lib/api/client';

describe('TASK 6: API client request URL construction and query parameter merging', () => {
  it('handles an endpoint that already has a query string without repeating it', () => {
    const url = buildRequestUrl('/products?category=scrunchies', undefined, '');
    expect(url).toBe('/products?category=scrunchies');
  });

  it('handles an endpoint with separate params', () => {
    const url = buildRequestUrl('/products', { category: 'scrunchies' }, '');
    expect(url).toBe('/products?category=scrunchies');
  });

  it('merges existing query string in endpoint with separate params without duplication', () => {
    const url = buildRequestUrl('/products?category=scrunchies', { sort: 'price_asc' }, '');
    expect(url).toBe('/products?category=scrunchies&sort=price_asc');
  });

  it('handles a base URL with a trailing slash', () => {
    const url = buildRequestUrl('/products', undefined, 'https://api.example.com/');
    expect(url).toBe('https://api.example.com/products');
  });

  it('handles a base URL without a trailing slash', () => {
    const url = buildRequestUrl('/products', undefined, 'https://api.example.com');
    expect(url).toBe('https://api.example.com/products');
  });

  it('handles an endpoint with a leading slash', () => {
    const url = buildRequestUrl('/products', undefined, 'https://api.example.com');
    expect(url).toBe('https://api.example.com/products');
  });

  it('handles an endpoint without a leading slash', () => {
    const url = buildRequestUrl('products', undefined, 'https://api.example.com');
    expect(url).toBe('https://api.example.com/products');
  });

  it('merges params and query string with base URL with trailing slash and endpoint without leading slash', () => {
    const url = buildRequestUrl(
      'products?category=scrunchies',
      { page: 2, limit: 10 },
      'https://api.example.com/'
    );
    expect(url).toBe('https://api.example.com/products?category=scrunchies&page=2&limit=10');
  });

  it('ensures apiFetch invokes fetch with the correctly constructed URL', async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({ success: true }),
    });
    globalThis.fetch = fetchMock;

    try {
      await apiFetch('/items?filter=active', { params: { sort: 'asc' } });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const requestedUrl = fetchMock.mock.calls[0][0];
      expect(requestedUrl).toBe('/items?filter=active&sort=asc');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
