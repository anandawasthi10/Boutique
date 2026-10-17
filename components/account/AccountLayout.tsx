'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AccountNav } from './AccountNav';

interface AccountLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({
  children,
  title = 'My Account',
  description = 'Manage your profile details, address book, and order history.',
}) => {
  return (
    <ProtectedRoute>
      <div className="bg-[var(--color-bg)] min-h-[calc(100vh-200px)] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-8">
            <h1 className="text-h2 font-serif text-[var(--color-text)] mb-1">
              {title}
            </h1>
            <p className="text-body-small text-[var(--color-text-muted)]">
              {description}
            </p>
          </div>

          {/* Main Account Grid: 4 cols for nav on desktop, 8 cols for main content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <aside className="lg:col-span-4 w-full">
              <AccountNav />
            </aside>
            <div className="lg:col-span-8 w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
