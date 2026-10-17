import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateMetadata } from '@/app/product/[slug]/page';
import { productsApi } from '@/lib/api';

describe('TASK 7: Product page generateMetadata', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('generates dynamic title, description, and absolute open graph image for a valid product', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'classic-scrunchie' }),
    });

    expect(metadata.title).toBe('Classic Scrunchie');
    expect(metadata.description).toBeTruthy();
    expect(metadata.openGraph?.title).toBe('Classic Scrunchie');

    const images = metadata.openGraph?.images;
    expect(Array.isArray(images)).toBe(true);
    if (Array.isArray(images) && images.length > 0) {
      const firstImage = images[0] as { url: string; alt?: string };
      expect(firstImage.url).toMatch(/^https?:\/\//);
      expect(firstImage.url).toContain('/images/productimages/classic-scrunchie-1.jpg');
    }
  });

  it('falls back to generic metadata when product does not exist without throwing', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'non-existent-product' }),
    });

    expect(metadata.title).toBe('Handcrafted Accessory | Bespoke Collection');
    expect(metadata.description).toBe('Handcrafted accessory made with tactile fabrics.');
  });

  it('falls back to generic metadata when API rejects without throwing', async () => {
    vi.spyOn(productsApi, 'getProductBySlug').mockRejectedValueOnce(new Error('Network error'));

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'classic-scrunchie' }),
    });

    expect(metadata.title).toBe('Handcrafted Accessory | Bespoke Collection');
    expect(metadata.description).toBe('Handcrafted accessory made with tactile fabrics.');
  });
});
