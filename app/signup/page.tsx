import { Suspense } from 'react';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/config/site';
import { SignupContent } from './SignupContent';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: `Create an Account | ${SITE_CONFIG.brandName}`,
  description: 'Sign up for a bespoke accessories account to save configurations, manage addresses and review orders.',
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
