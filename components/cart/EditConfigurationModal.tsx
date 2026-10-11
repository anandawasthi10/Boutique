'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem, Product } from '@/lib/types';
import { productsApi } from '@/lib/api';
import { useCart } from '@/lib/hooks/useCart';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ProductConfigurator } from '@/components/configurator/ProductConfigurator';
import { Loader2, AlertCircle } from 'lucide-react';

export interface EditConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
}

export const EditConfigurationModal: React.FC<EditConfigurationModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const { updateConfiguration } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [prevItemId, setPrevItemId] = useState<string | null>(null);

  // Render-time state reset when target item or open state changes
  const currentItemId = isOpen && item ? item.id : null;
  if (currentItemId !== prevItemId) {
    setPrevItemId(currentItemId);
    setSaveError(null);
    setIsSaving(false);
    if (currentItemId) {
      setIsLoadingProduct(true);
      setProduct(null);
      setProductError(null);
    } else {
      setIsLoadingProduct(false);
      setProduct(null);
      setProductError(null);
    }
  }

  const handleRetry = useCallback(() => {
    if (!item) return;
    setIsLoadingProduct(true);
    setProductError(null);
    const targetIdentifier = item.productSlug || item.productId;
    productsApi
      .getProductBySlug(targetIdentifier)
      .then((data) => {
        setProduct(data);
        setIsLoadingProduct(false);
      })
      .catch((err) => {
        setProductError(
          err instanceof Error ? err.message : 'Could not load product details for configuration.'
        );
        setIsLoadingProduct(false);
      });
  }, [item]);

  useEffect(() => {
    if (!isOpen || !item) return;

    let active = true;
    const targetIdentifier = item.productSlug || item.productId;

    productsApi
      .getProductBySlug(targetIdentifier)
      .then((data) => {
        if (active) {
          setProduct(data);
          setIsLoadingProduct(false);
        }
      })
      .catch((err) => {
        if (active) {
          setProductError(
            err instanceof Error ? err.message : 'Could not load product details for configuration.'
          );
          setIsLoadingProduct(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, item]);

  // Transform item.selectedOptions into group -> optionId map
  const initialSelections = useMemo(() => {
    if (!item?.selectedOptions) return {};
    const map: Record<string, string> = {};
    item.selectedOptions.forEach((opt) => {
      map[opt.groupId] = opt.optionId;
    });
    return map;
  }, [item]);

  const handleSave = async (selectedOptionIds: Record<string, string>) => {
    if (!item) return;
    setIsSaving(true);
    setSaveError(null);

    const optionIdsOnly = Object.values(selectedOptionIds).filter((id): id is string => Boolean(id));

    try {
      await updateConfiguration(item.id, optionIdsOnly);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Configuration: ${item?.productName || 'Item'}`}
      maxWidth="lg"
    >
      <div data-testid="edit-configuration-modal-content" className="flex flex-col gap-4">
        {/* Loading Product State */}
        {isLoadingProduct && (
          <div
            data-testid="edit-config-loading"
            className="py-12 flex flex-col items-center justify-center gap-3 text-center"
          >
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            <p className="text-sm text-[var(--color-text-muted)]">
              Loading bespoke options for {item?.productName}...
            </p>
          </div>
        )}

        {/* Error Loading Product State */}
        {!isLoadingProduct && productError && (
          <div
            data-testid="edit-config-error"
            className="p-6 rounded-[4px] bg-error/10 border border-error/20 flex flex-col items-center text-center gap-3"
          >
            <AlertCircle className="w-8 h-8 text-[var(--color-error)]" />
            <p className="text-sm text-[var(--color-text)]">{productError}</p>
            <Button
              variant="secondary"
              onClick={handleRetry}
            >
              Retry Loading Options
            </Button>
          </div>
        )}

        {/* Configurator Loaded */}
        {!isLoadingProduct && !productError && product && (
          <div className="flex flex-col gap-4">
            {saveError && (
              <div
                data-testid="edit-config-save-error"
                className="p-3 rounded-[4px] bg-error/10 border border-error/20 text-xs text-[var(--color-error)] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <ProductConfigurator
              key={`${item?.id}-${product.id}`}
              product={product}
              initialSelections={initialSelections}
              showPreview={true}
              renderAddToCart={(configState) => (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!configState.canAddToCart || isSaving}
                    isLoading={isSaving}
                    onClick={() => handleSave(configState.selectedOptionIds)}
                    className="w-full sm:w-auto"
                    data-testid="save-configuration-btn"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
