import { Suspense } from 'react';
import { Metadata } from 'next';
import { ResetPasswordContent } from './ResetPasswordContent';

export const metadata: Metadata = {
  title: 'Reset Password | Bespoke Handmade Accessories',
  description: 'Choose a new password for your account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
