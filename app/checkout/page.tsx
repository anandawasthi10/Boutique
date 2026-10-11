import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CheckoutContent } from './CheckoutContent';

export const metadata: Metadata = {
  title: 'Checkout | Bespoke Handmade Accessories',
  description: 'Complete your purchase for handcrafted bespoke accessories.',
};

export default function CheckoutPage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <CheckoutContent />
    </ProtectedRoute>
  );
}
