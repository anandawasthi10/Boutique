import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { productsApi, categoriesApi } from '@/lib/api';

describe('TASK 8: Robots and Sitemap generators', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://bespokestudio.example.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('app/robots.ts', () => {
    it('disallows everything when NEXT_PUBLIC_ALLOW_INDEXING is false or unset', () => {
      vi.stubEnv('NEXT_PUBLIC_ALLOW_INDEXING', 'false');
      const config = robots();
      expect(config.rules).toEqual({
        userAgent: '*',
        disallow: '/',
      });
      expect(config.sitemap).toBe('https://bespokestudio.example.com/sitemap.xml');
    });

    it('allows public pages and disallows private/checkout/account routes when NEXT_PUBLIC_ALLOW_INDEXING is true', () => {
      vi.stubEnv('NEXT_PUBLIC_ALLOW_INDEXING', 'true');
      const config = robots();
      const rules = config.rules as { userAgent: string; allow: string; disallow: string[] };

      expect(rules.userAgent).toBe('*');
      expect(rules.allow).toBe('/');
      expect(rules.disallow).toEqual([
        '/account',
        '/cart',
        '/checkout',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/order-confirmation',
        '/api',
        '/component-preview',
      ]);
      expect(config.sitemap).toBe('https://bespokestudio.example.com/sitemap.xml');
    });
  });

  describe('app/sitemap.ts', () => {
    it('includes product and category pages when API resolves', async () => {
      vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
      const items = await sitemap();

      const urls = items.map((i) => i.url);
      expect(urls).toContain('https://bespokestudio.example.com');
      expect(urls).toContain('https://bespokestudio.example.com/shop');
      expect(urls).toContain('https://bespokestudio.example.com/category/scrunchies');
      expect(urls).toContain('https://bespokestudio.example.com/product/classic-scrunchie');
    });

    it('returns only static routes without throwing when API fails', async () => {
      vi.spyOn(productsApi, 'getProducts').mockRejectedValueOnce(new Error('Backend offline'));
      vi.spyOn(categoriesApi, 'getCategories').mockRejectedValueOnce(new Error('Backend offline'));

      const items = await sitemap();
      expect(items.length).toBeGreaterThanOrEqual(7);

      const urls = items.map((i) => i.url);
      expect(urls).toContain('https://bespokestudio.example.com/shop');
      expect(urls).toContain('https://bespokestudio.example.com/about');
      expect(urls).toContain('https://bespokestudio.example.com/contact');
      // Should not throw and should still have static routes
    });
  });
});
