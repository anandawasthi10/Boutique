'use client';

import React from 'react';
import { Check, Clock, AlertTriangle } from 'lucide-react';
import { OrderStatus } from '@/lib/types';

interface OrderTimelineProps {
  status: OrderStatus;
}

interface StepDef {
  key: OrderStatus;
  label: string;
  description: string;
}

const TIMELINE_STEPS: StepDef[] = [
  { key: 'placed', label: 'Placed', description: 'Order received' },
  { key: 'confirmed', label: 'Confirmed', description: 'Order confirmed' },
  { key: 'in_production', label: 'In Production', description: 'Handcrafted in studio' },
  { key: 'packed', label: 'Packed', description: 'Quality-checked & boxed' },
  { key: 'dispatched', label: 'Dispatched', description: 'On the way' },
  { key: 'delivered', label: 'Delivered', description: 'Delivered safely' },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <div
        data-testid="order-timeline-cancelled"
        className="p-5 rounded-xl border flex items-center gap-3 text-sm"
        style={{
          backgroundColor: 'rgba(179, 70, 63, 0.08)',
          borderColor: 'rgba(179, 70, 63, 0.25)',
          color: 'var(--color-error)',
        }}
      >
        <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">Order Cancelled</p>
          <p className="text-xs opacity-90 mt-0.5">
            This order has been cancelled and will not progress through production or dispatch.
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === status);
  // Default to 0 if status is unknown
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

  return (
    <nav
      aria-label="Order progress"
      data-testid="order-timeline"
      className="py-4"
    >
      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-2">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;

          let stepStatusText = 'Upcoming';
          if (isCompleted) stepStatusText = 'Completed';
          if (isCurrent) stepStatusText = 'Current step';

          return (
            <li
              key={step.key}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex flex-col items-center text-center p-3 rounded-lg relative"
              style={{
                backgroundColor: isCurrent ? 'var(--color-surface)' : 'transparent',
                border: isCurrent ? '1px solid var(--color-border)' : '1px solid transparent',
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-2 transition-colors"
                style={{
                  backgroundColor: isCompleted
                    ? 'var(--color-sage-deep)'
                    : isCurrent
                    ? 'var(--color-primary)'
                    : 'var(--color-surface)',
                  color: isCompleted || isCurrent ? 'var(--color-primary-text)' : 'var(--color-text-muted)',
                  border: isCompleted || isCurrent ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-pulse" aria-hidden="true" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <span
                className="text-xs font-semibold block leading-tight"
                style={{
                  color: isCurrent || isCompleted ? 'var(--color-text)' : 'var(--color-text-muted)',
                }}
              >
                {step.label}
              </span>

              <span
                className="text-[11px] mt-0.5 leading-tight block"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {step.description}
              </span>

              {/* Screen reader only announcement */}
              <span className="sr-only">({stepStatusText})</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
