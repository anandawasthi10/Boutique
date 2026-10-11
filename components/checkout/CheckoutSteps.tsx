'use client';

import React from 'react';
import { Check } from 'lucide-react';

export type CheckoutStep = 'address' | 'review';

export interface CheckoutStepsProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
  canNavigateToReview?: boolean;
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({
  currentStep,
  onStepClick,
  canNavigateToReview = false,
}) => {
  const steps: { id: CheckoutStep; label: string; number: number }[] = [
    { id: 'address', label: 'Delivery Address', number: 1 },
    { id: 'review', label: 'Review & Payment', number: 2 },
  ];

  const isCompleted = (stepId: CheckoutStep): boolean => {
    if (stepId === 'address' && currentStep === 'review') return true;
    return false;
  };

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-center max-w-lg mx-auto">
        {steps.map((step, idx) => {
          const active = currentStep === step.id;
          const completed = isCompleted(step.id);
          const isClickable =
            Boolean(onStepClick) && (step.id === 'address' || canNavigateToReview);

          return (
            <li
              key={step.id}
              className={`flex items-center ${idx < steps.length - 1 ? 'w-full' : ''}`}
            >
              <div className="flex flex-col items-center relative">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  aria-current={active ? 'step' : undefined}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-150 ${
                    completed
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] cursor-pointer'
                      : active
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] ring-4 ring-[var(--color-primary)]/20'
                      : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]'
                  } ${!isClickable ? 'cursor-default' : 'hover:opacity-90'}`}
                >
                  {completed ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </button>
                <span
                  className={`text-xs mt-2 whitespace-nowrap font-medium ${
                    active
                      ? 'text-[var(--color-text)] font-semibold'
                      : completed
                      ? 'text-[var(--color-text)]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`flex-1 h-0.5 mx-4 -mt-5 transition-colors duration-150 ${
                    completed
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-border)]'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
