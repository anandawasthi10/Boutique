'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import { addressesApi, checkoutApi } from '@/lib/api';
import { Address } from '@/lib/types';
import { CheckoutSteps, CheckoutStep } from '@/components/checkout/CheckoutSteps';
import { AddressSelectionStep } from '@/components/checkout/AddressSelectionStep';
import { OrderReviewStep } from '@/components/checkout/OrderReviewStep';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';
import { startPayment } from '@/lib/payment';

export const CheckoutContent: React.FC = () => {
  const router = useRouter();
  const { cart, isLoading: isCartLoading, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    addressesApi
      .getAddresses()
      .then((list) => {
        if (isMounted) {
          setAddresses(list);
          if (list.length > 0) {
            const def = list.find((a) => a.isDefault) ?? list[0];
            setSelectedAddress(def);
          }
          setIsLoadingAddresses(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingAddresses(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddressAdded = (newAddress: Address) => {
    setAddresses((prev) => [...prev, newAddress]);
    setSelectedAddress(newAddress);
  };

  const handlePay = async () => {
    if (!selectedAddress || isSubmittingCheckout) return;

    setIsSubmittingCheckout(true);
    setCheckoutError(null);

    try {
      const response = await checkoutApi.createCheckout({
        addressId: selectedAddress.id,
      });

      // Clear frontend cart on confirmed checkout handoff
      clearCart();

      // Hand off to payment module (FE-30)
      const paymentResult = await startPayment({
        orderId: response.order.id,
        amount: response.paymentInfo.amount,
        currency: response.paymentInfo.currency,
        gatewayOrderId: response.paymentInfo.gatewayOrderId,
        keyId: response.paymentInfo.keyId,
      });

      // Navigate to payment result / confirmation screen
      router.push(paymentResult.redirectUrl);
    } catch (err) {
      // Criterion 6: Failure keeps the cart and shows retry option
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not complete checkout. Please try again.';
      setCheckoutError(msg);
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="bg-[var(--color-bg)] min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="h-8 bg-[var(--color-border)]/40 rounded w-48 mb-8 animate-pulse" />
        <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] animate-pulse" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-[var(--color-bg)] min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-h1 font-serif text-[var(--color-text)] mb-2">
            Checkout
          </h1>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-8 sm:p-12 text-center">
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8 text-[var(--color-text-muted)]" />}
            title="Your Cart is Empty"
            headingLevel="h2"
            description="You don't have any bespoke items in your cart to checkout."
          >
            <Link
              href="/shop"
              className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-[4px] bg-[var(--color-primary)] text-[var(--color-primary-text)] font-medium text-sm hover:bg-[#5D4940] transition-colors uppercase tracking-wide"
            >
              Shop Accessories
            </Link>
          </EmptyState>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-[calc(100vh-200px)] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-h1 font-serif text-[var(--color-text)] mb-2">
            Checkout
          </h1>
          <p className="text-body-small text-[var(--color-text-muted)]">
            Complete your order for handcrafted bespoke accessories.
          </p>
        </div>

        {/* Checkout Stepper Progress */}
        <CheckoutSteps
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step === 'address') setCurrentStep('address');
            if (step === 'review' && selectedAddress) setCurrentStep('review');
          }}
          canNavigateToReview={Boolean(selectedAddress)}
        />

        {/* Steps Content */}
        {currentStep === 'address' ? (
          <AddressSelectionStep
            addresses={addresses}
            selectedAddressId={selectedAddress?.id ?? null}
            onSelectAddress={(addr) => setSelectedAddress(addr)}
            onAddressAdded={handleAddressAdded}
            onContinue={() => setCurrentStep('review')}
            isLoading={isLoadingAddresses}
          />
        ) : selectedAddress ? (
          <OrderReviewStep
            cart={cart}
            deliveryAddress={selectedAddress}
            onChangeAddress={() => setCurrentStep('address')}
            onPay={handlePay}
            isSubmitting={isSubmittingCheckout}
            checkoutError={checkoutError}
          />
        ) : (
          <div className="text-center py-8">
            <button
              type="button"
              onClick={() => setCurrentStep('address')}
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              Please select a delivery address first
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
