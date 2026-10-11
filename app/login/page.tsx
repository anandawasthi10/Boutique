import { Suspense } from 'react';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/config/site';
import { LoginContent } from './LoginContent';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: `Sign In | ${SITE_CONFIG.brandName}`,
  description: 'Sign in to your bespoke accessories account to manage orders and configurations.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
