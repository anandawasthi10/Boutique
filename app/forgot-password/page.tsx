import { Metadata } from 'next';
import { ForgotPasswordContent } from './ForgotPasswordContent';

export const metadata: Metadata = {
  title: 'Forgot Password | Bespoke Handmade Accessories',
  description: 'Request a password reset link for your account.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
