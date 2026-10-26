import React from 'react';
import Image from 'next/image';
import { Product, Option } from '@/lib/types';
import { usePreferences } from '@/lib/hooks/usePreferences';

export interface ConfiguratorPreviewProps {
  product: Product;
  selectedOptionIds: Record<string, string>;
  className?: string;
}

export const ConfiguratorPreview: React.FC<ConfiguratorPreviewProps> = ({
  product,
  selectedOptionIds,
  className = '',
}) => {
  const { reducedMotion } = usePreferences();

  // Find any option that provides an API preview image
  let previewImageOption: Option | null = null;
  let selectedFabricOption: Option | null = null;

  for (const group of product.optionGroups) {
    const selectedId = selectedOptionIds[group.id];
    if (selectedId) {
      const opt = group.options.find((o) => o.id === selectedId);
      if (opt) {
        if (opt.previewImageUrl && !previewImageOption) {
          previewImageOption = opt;
        }
        if (group.type === 'swatch' && !selectedFabricOption) {
          selectedFabricOption = opt;
        }
      }
    }
  }

  const baseImage = product.images[0] || {
    url: '/images/products/placeholder.svg',
    alt: product.name,
  };

  const currentImageUrl = previewImageOption?.previewImageUrl || baseImage.url;
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null);
  const effectiveImageUrl = failedUrl === currentImageUrl ? '/images/products/placeholder.svg' : currentImageUrl;

  const currentImageAlt = previewImageOption
    ? `${product.name} customised with ${previewImageOption.label}`
    : baseImage.alt;

  const transitionClass = reducedMotion
    ? 'transition-none'
    : 'transition-opacity duration-250';

  return (
    <div
      data-testid="configurator-preview"
      className={`flex flex-col gap-3 ${className}`}
    >
      {/* Main Preview Container */}
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-[4px] bg-[var(--color-surface)] border border-[var(--color-border)]">
        <Image
          src={effectiveImageUrl}
          alt={currentImageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          priority
          className={`object-cover ${transitionClass}`}
          onError={() => {
            if (effectiveImageUrl !== '/images/products/placeholder.svg') {
              setFailedUrl(effectiveImageUrl);
            }
          }}
        />

        {previewImageOption && (
          <div className="absolute top-3 left-3 bg-surface px-2.5 py-1 rounded-[4px] text-xs font-medium text-text border border-border">
            Preview: {previewImageOption.label}
          </div>
        )}
      </div>

      {/* When the API does NOT supply an image for the selection, the photo stays and the swatch card shows the chosen fabric */}
      {!previewImageOption && selectedFabricOption && (
        <div
          data-testid="selected-swatch-card"
          className="flex items-center gap-3 p-3 rounded-[4px] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs"
        >
          <div className="relative w-12 h-12 rounded-[4px] overflow-hidden shrink-0 border border-border">
            {selectedFabricOption.swatchImageUrl ? (
              <Image
                src={selectedFabricOption.swatchImageUrl}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div
                className="w-full h-full bg-surface-alt flex items-center justify-center text-xs text-text-muted"
                aria-hidden="true"
              >
                {selectedFabricOption.label.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
              Selected Fabric Swatch
            </span>
            <span className="text-sm font-medium text-[var(--color-text)]">
              {selectedFabricOption.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
