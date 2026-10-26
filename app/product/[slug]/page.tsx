import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductDetailContent } from './ProductDetailContent';
import { Skeleton } from '@/components/ui/Skeleton';


import { productsApi } from '@/lib/api';

const DEFAULT_METADATA: Metadata = {
  title: 'Handcrafted Accessory | Bespoke Collection',
  description: 'Handcrafted accessory made with tactile fabrics.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  'use cache';
  try {
    const { slug } = await params;
    const product = await productsApi.getProductBySlug(slug);
    if (!product) {
      return DEFAULT_METADATA;
    }

    const firstImage = product.images?.[0];
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const ogImageUrl = firstImage?.url
      ? firstImage.url.startsWith('http')
        ? firstImage.url
        : `${siteUrl}${firstImage.url.startsWith('/') ? '' : '/'}${firstImage.url}`
      : undefined;

    const shortDescription = product.description.length > 160
      ? `${product.description.slice(0, 157)}...`
      : product.description;

    return {
      title: product.name,
      description: shortDescription,
      openGraph: {
        title: product.name,
        description: shortDescription,
        images: ogImageUrl ? [{ url: ogImageUrl, alt: firstImage?.alt || product.name }] : [],
      },
    };
  } catch {
    return DEFAULT_METADATA;
  }
}

async function ProductDetailWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailContent slug={slug} />;
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
          <Skeleton width="40%" height={20} className="mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7">
              <Skeleton className="aspect-4/5 w-full rounded-[4px]" />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-4">
              <Skeleton width="80%" height={36} />
              <Skeleton width="30%" height={24} />
            </div>
          </div>
        </div>
      }
    >
      <ProductDetailWrapper params={params} />
    </Suspense>
  );
}
