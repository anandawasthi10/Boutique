import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { CategoryContent } from './CategoryContent';
import { ProductGrid } from '@/components/catalogue';
import { categoriesApi } from '@/lib/api';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const categories = await categoriesApi.getCategories();
    const matched = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
    if (matched) {
      return {
        title: `${matched.name} | Handcrafted Accessories`,
        description: matched.description || `Handcrafted ${matched.name} made with tactile fabrics.`,
      };
    }
  } catch {
    // fallback
  }

  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${capitalized} | Handcrafted Accessories`,
    description: `Shop handcrafted ${slug} accessories.`,
  };
}

async function CategoryWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryContent slug={slug} />;
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
          <ProductGrid isLoading={true} />
        </div>
      }
    >
      <CategoryWrapper params={params} />
    </Suspense>
  );
}
