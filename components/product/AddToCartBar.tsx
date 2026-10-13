'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Product, OptionGroup } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { useCart } from '@/lib/hooks/useCart';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { usePreferences } from '@/lib/hooks/usePreferences';

export interface AddToCartBarProps {
  product: Product;
  selectedOptionIds: Record<string, string>;
  isComplete: boolean;
  isValid: boolean;
  canAddToCart: boolean;
  isLoadingQuote?: boolean;
  isQuoteOutdated?: boolean;
  missingRequiredGroups?: OptionGroup[];
  className?: string;
  onSuccess?: () => void;
}

export const AddToCartBar: React.FC<AddToCartBarProps> = ({
  product,
  selectedOptionIds,
  isComplete,
  isValid,
  canAddToCart,
  isLoadingQuote = false,
  isQuoteOutdated = false,
  missingRequiredGroups = [],
  className = '',
  onSuccess,
}) => {
  const router = useRouter();
  const { addToCart, openDrawer } = useCart();
  const { user, loading: userLoading } = useCurrentUser();
  const { reducedMotion } = usePreferences();

  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'cart' | 'buy_now' | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Determine user-visible disabled reason
  let disabledReason: string | null = null;
  if (missingRequiredGroups.length > 0) {
    disabledReason = `Please select ${missingRequiredGroups.map((g) => g.label).join(', ')}`;
  } else if (!isComplete) {
    disabledReason = 'Please complete all required selections';
  } else if (isLoadingQuote || isQuoteOutdated) {
    disabledReason = 'Updating price...';
  } else if (!isValid) {
    disabledReason = 'Selection is currently invalid';
  }

  const handleAddToCart = async () => {
    if (!canAddToCart || isSubmitting) return;

    // Guest add to cart: preserve selections in query and redirect to login
    if (!user && !userLoading) {
      const searchParams = new URLSearchParams(selectedOptionIds);
      const returnUrl = `/product/${product.slug}?${searchParams.toString()}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setIsSubmitting(true);
    setActionType('cart');
    setSubmitError(null);

    // Strict requirement: configuration sent contains option IDs only
    const optionIdsOnly = Object.values(selectedOptionIds).filter(Boolean);

    try {
      await addToCart({
        productId: product.id,
        selectedOptionIds: optionIdsOnly,
        quantity,
      });

      setIsSuccess(true);
      onSuccess?.();

      setTimeout(() => {
        setIsSuccess(false);
        openDrawer();
      }, reducedMotion ? 50 : 350);
    } catch (err) {
      // On failure, configuration is preserved and error message shown with retry offered
      const msg = err instanceof Error ? err.message : 'Unable to add item to cart.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const handleBuyNow = async () => {
    if (!canAddToCart || isSubmitting) return;

    if (!user && !userLoading) {
      const searchParams = new URLSearchParams(selectedOptionIds);
      const returnUrl = `/product/${product.slug}?${searchParams.toString()}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setIsSubmitting(true);
    setActionType('buy_now');
    setSubmitError(null);

    const optionIdsOnly = Object.values(selectedOptionIds).filter(Boolean);

    try {
      await addToCart({
        productId: product.id,
        selectedOptionIds: optionIdsOnly,
        quantity,
      });

      onSuccess?.();
      router.push('/checkout');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to proceed with Buy Now.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  return (
    <div
      data-testid="add-to-cart-bar"
      className={`p-4 rounded-[4px] bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-4 ${className}`}
    >
      {/* Error state with retry action */}
      {submitError && (
        <div
          data-testid="add-to-cart-error"
          className="flex items-center justify-between p-3 rounded-[4px] bg-error/10 border border-error/20 text-xs text-error"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1 font-semibold underline hover:opacity-75 cursor-pointer ml-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Disabled reason notice when configuration incomplete */}
      {!canAddToCart && disabledReason && (
        <div
          data-testid="disabled-reason-notice"
          className="text-xs text-[var(--color-text-muted)] font-medium flex items-center gap-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5 text-[var(--color-warning)] shrink-0" />
          <span>{disabledReason}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity Stepper */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] sm:hidden">
            Quantity:
          </span>
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => setQuantity((q) => q + 1)}
            onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={!canAddToCart || isSubmitting}
            itemName={product.name}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
          {/* Add to Cart button */}
          <Button
            variant="primary"
            onClick={handleAddToCart}
            disabled={!canAddToCart || isSubmitting}
            isLoading={isSubmitting && actionType === 'cart'}
            className="flex-1 justify-center relative min-h-[48px]"
          >
            {isSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-[var(--color-success)] font-semibold">
                <Check className="w-4 h-4 stroke-[3]" />
                Added to Bag
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </span>
            )}
          </Button>

          {/* Buy Now button */}
          <Button
            variant="secondary"
            onClick={handleBuyNow}
            disabled={!canAddToCart || isSubmitting}
            isLoading={isSubmitting && actionType === 'buy_now'}
            className="flex-1 justify-center min-h-[48px]"
          >
            <span>Buy Now</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
