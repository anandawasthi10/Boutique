import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

  if (!allowIndexing) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
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
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
