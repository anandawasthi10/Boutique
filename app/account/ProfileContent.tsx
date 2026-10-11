'use client';

import React from 'react';
import { User, Mail, Phone, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export const ProfileContent: React.FC = () => {
  const { user, isLoading, refreshUser } = useAuth();

  if (isLoading) {
    return (
      <div
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-6 sm:p-8 animate-pulse"
        data-testid="profile-loading"
        role="status"
        aria-label="Loading profile information"
      >
        <div className="h-6 bg-[var(--color-border)]/50 rounded w-1/4 mb-6" />
        <div className="space-y-4">
          <div className="h-12 bg-[var(--color-border)]/30 rounded" />
          <div className="h-12 bg-[var(--color-border)]/30 rounded" />
          <div className="h-12 bg-[var(--color-border)]/30 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-8 text-center"
        data-testid="profile-error"
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center text-[var(--color-error)]">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-h3 font-serif text-[var(--color-text)] mb-2">
          Unable to Load Profile
        </h2>
        <p className="text-body-small text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
          We encountered an error loading your account details. Please verify your connection and try again.
        </p>
        <Button
          variant="secondary"
          onClick={() => refreshUser()}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  // Format creation date if provided by API
  let formattedJoinedDate: string | null = null;
  if (user.createdAt) {
    try {
      formattedJoinedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      formattedJoinedDate = user.createdAt;
    }
  }

  return (
    <div
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-6 sm:p-8 shadow-xs"
      data-testid="profile-content"
    >
      <div className="border-b border-[var(--color-border)] pb-6 mb-6">
        <h2 className="text-h3 font-serif text-[var(--color-text)] mb-1">
          Profile Details
        </h2>
        <p className="text-body-small text-[var(--color-text-muted)]">
          Your personal information as recorded on your account.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[4px] p-4 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-caption uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
              Full Name
            </p>
            <p className="text-body font-medium text-[var(--color-text)] mt-0.5" data-testid="profile-name">
              {user.name}
            </p>
          </div>
        </div>

        {/* Email Address */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[4px] p-4 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-caption uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
              Email Address
            </p>
            <p className="text-body font-medium text-[var(--color-text)] mt-0.5" data-testid="profile-email">
              {user.email}
            </p>
          </div>
        </div>

        {/* Phone Number (if returned by API) */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[4px] p-4 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-caption uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
              Phone Number
            </p>
            <p className="text-body font-medium text-[var(--color-text)] mt-0.5" data-testid="profile-phone">
              {user.phone ? user.phone : 'Not provided'}
            </p>
          </div>
        </div>

        {/* Member Since / Account ID */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[4px] p-4 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-caption uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
              Account Reference
            </p>
            <p className="text-body font-medium text-[var(--color-text)] mt-0.5" data-testid="profile-member-since">
              {formattedJoinedDate ? `Member since ${formattedJoinedDate}` : `ID: ${user.id}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
