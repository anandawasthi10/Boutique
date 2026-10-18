'use client';

import GlobalError from '@/app/error';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <GlobalError
      error={error}
      reset={reset}
      title="Checkout error"
      description="We encountered an issue loading checkout. Your bag has been saved. Please try again or return to the shop."
      secondaryHref="/shop"
      secondaryLabel="Return to Shop"
    />
  );
}
