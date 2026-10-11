import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { productsApi, cartApi, ApiException } from '@/lib/api';

describe('FE-06: API client and error handling', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('successfully fetches products through productsApi and sends credentials', async () => {
    const mockProducts = {
      items: [
        {
          id: 'prod-1',
          slug: 'scrunchie-floral',
          name: 'Floral Scrunchie',
          basePrice: 299,
          images: [],
          category: { id: 'c1', name: 'Scrunchies' },
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockProducts,
    });

    const result = await productsApi.getProducts({ page: 1 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Floral Scrunchie');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/products?page=1'),
      expect.objectContaining({
        credentials: 'include',
      })
    );
  });

  it('converts network failures into standard ApiError with code NETWORK_ERROR', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    await expect(productsApi.getProductBySlug('test-slug')).rejects.toThrowError();

    try {
      await productsApi.getProductBySlug('test-slug');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiException);
      const apiErr = err as ApiException;
      expect(apiErr.code).toBe('NETWORK_ERROR');
      expect(apiErr.message).toContain('Failed to fetch');
    }
  });

  it('converts server field errors into standard ApiError with fieldErrors map', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        code: 'VALIDATION_FAILED',
        message: 'Invalid item parameters provided',
        fieldErrors: {
          quantity: 'Quantity must be at least 1',
        },
      }),
    });

    try {
      await cartApi.addToCart({
        productId: 'p1',
        selectedOptionIds: [],
        quantity: 0,
      });
      expect.unreachable('Should have thrown an error');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiException);
      const apiErr = err as ApiException;
      expect(apiErr.code).toBe('VALIDATION_FAILED');
      expect(apiErr.message).toBe('Invalid item parameters provided');
      expect(apiErr.fieldErrors?.quantity).toBe('Quantity must be at least 1');
    }
  });

  it('converts malformed json responses into standard ApiError shape', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => {
        throw new Error('Unexpected token < in JSON');
      },
    });

    try {
      await cartApi.getCart();
      expect.unreachable('Should have thrown an error');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiException);
      const apiErr = err as ApiException;
      expect(apiErr.code).toBe('MALFORMED_RESPONSE');
    }
  });
});
