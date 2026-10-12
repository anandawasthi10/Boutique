import { OrderStatus, PaymentStatus } from '../types';

export interface StatusMeta {
  label: string;
  description: string;
  badgeStyle: {
    backgroundColor: string;
    color: string;
    borderColor: string;
  };
}

export function formatOrderStatus(status: OrderStatus): StatusMeta {
  switch (status) {
    case 'placed':
      return {
        label: 'Order Placed',
        description: 'Your order has been received.',
        badgeStyle: {
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderColor: 'var(--color-border)',
        },
      };
    case 'confirmed':
      return {
        label: 'Order Confirmed',
        description: 'Your order has been confirmed.',
        badgeStyle: {
          backgroundColor: 'rgba(111, 132, 112, 0.15)',
          color: 'var(--color-sage-deep)',
          borderColor: 'var(--color-sage)',
        },
      };
    case 'in_production':
      return {
        label: 'In Production',
        description: 'Your accessory is being handcrafted in our studio atelier.',
        badgeStyle: {
          backgroundColor: 'rgba(232, 196, 184, 0.3)',
          color: 'var(--color-primary)',
          borderColor: 'var(--color-blush-deep)',
        },
      };
    case 'packed':
      return {
        label: 'Carefully Packed',
        description: 'Quality-checked and wrapped with care.',
        badgeStyle: {
          backgroundColor: 'rgba(111, 132, 112, 0.15)',
          color: 'var(--color-sage-deep)',
          borderColor: 'var(--color-sage)',
        },
      };
    case 'dispatched':
      return {
        label: 'Dispatched',
        description: 'Your package is on its way.',
        badgeStyle: {
          backgroundColor: 'rgba(111, 132, 112, 0.2)',
          color: 'var(--color-sage-deep)',
          borderColor: 'var(--color-sage)',
        },
      };
    case 'delivered':
      return {
        label: 'Delivered',
        description: 'Your order has arrived safely.',
        badgeStyle: {
          backgroundColor: 'rgba(111, 132, 112, 0.25)',
          color: 'var(--color-sage-deep)',
          borderColor: 'var(--color-sage)',
        },
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        description: 'This order was cancelled.',
        badgeStyle: {
          backgroundColor: 'rgba(179, 70, 63, 0.1)',
          color: 'var(--color-error)',
          borderColor: 'rgba(179, 70, 63, 0.3)',
        },
      };
    default:
      return {
        label: String(status),
        description: '',
        badgeStyle: {
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderColor: 'var(--color-border)',
        },
      };
  }
}

export function formatPaymentStatus(status: PaymentStatus): StatusMeta {
  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        description: 'Payment successful.',
        badgeStyle: {
          backgroundColor: 'rgba(111, 132, 112, 0.15)',
          color: 'var(--color-sage-deep)',
          borderColor: 'var(--color-sage)',
        },
      };
    case 'pending':
      return {
        label: 'Payment Pending',
        description: 'Awaiting confirmation.',
        badgeStyle: {
          backgroundColor: 'rgba(217, 164, 65, 0.15)',
          color: 'var(--color-warning)',
          borderColor: 'rgba(217, 164, 65, 0.3)',
        },
      };
    case 'failed':
      return {
        label: 'Payment Failed',
        description: 'Payment was not successful.',
        badgeStyle: {
          backgroundColor: 'rgba(179, 70, 63, 0.1)',
          color: 'var(--color-error)',
          borderColor: 'rgba(179, 70, 63, 0.3)',
        },
      };
    case 'cancelled':
      return {
        label: 'Payment Cancelled',
        description: 'Session cancelled.',
        badgeStyle: {
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-muted)',
          borderColor: 'var(--color-border)',
        },
      };
    default:
      return {
        label: String(status),
        description: '',
        badgeStyle: {
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderColor: 'var(--color-border)',
        },
      };
  }
}
