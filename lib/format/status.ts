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
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-success)',
          borderColor: 'var(--color-sage)',
        },
      };
    case 'in_production':
      return {
        label: 'In Production',
        description: 'Your accessory is being handcrafted in our studio atelier.',
        badgeStyle: {
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-primary)',
          borderColor: 'var(--color-border)',
        },
      };
    case 'packed':
      return {
        label: 'Carefully Packed',
        description: 'Quality-checked and wrapped with care.',
        badgeStyle: {
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-success)',
          borderColor: 'var(--color-sage)',
        },
      };
    case 'dispatched':
      return {
        label: 'Dispatched',
        description: 'Your package is on its way.',
        badgeStyle: {
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-success)',
          borderColor: 'var(--color-sage)',
        },
      };
    case 'delivered':
      return {
        label: 'Delivered',
        description: 'Your order has arrived safely.',
        badgeStyle: {
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-success)',
          borderColor: 'var(--color-sage)',
        },
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        description: 'This order was cancelled.',
        badgeStyle: {
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-error)',
          borderColor: 'var(--color-border)',
        },
      };
    default:
      return {
        label: String(status),
        description: '',
        badgeStyle: {
          backgroundColor: 'var(--color-bg)',
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
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-success)',
          borderColor: 'var(--color-sage)',
        },
      };
    case 'pending':
      return {
        label: 'Payment Pending',
        description: 'Awaiting confirmation.',
        badgeStyle: {
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-warning)',
          borderColor: 'var(--color-border)',
        },
      };
    case 'failed':
      return {
        label: 'Payment Failed',
        description: 'Payment was not successful.',
        badgeStyle: {
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-error)',
          borderColor: 'var(--color-border)',
        },
      };
    case 'cancelled':
      return {
        label: 'Payment Cancelled',
        description: 'Session cancelled.',
        badgeStyle: {
          backgroundColor: 'var(--color-bg)',
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
