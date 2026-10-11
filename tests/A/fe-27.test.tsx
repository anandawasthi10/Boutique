import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AccountNav } from '@/components/account/AccountNav';
import { AccountLayout } from '@/components/account/AccountLayout';
import { ProfileContent } from '@/app/account/ProfileContent';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { authApi } from '@/lib/api';
import { User } from '@/lib/types';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockPathname = '/account';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

const mockUser: User = {
  id: 'usr-101',
  name: 'Ananya Roy',
  email: 'ananya@example.com',
  phone: '9876543210',
  createdAt: '2026-05-15T10:00:00.000Z',
};

describe('FE-27: Account and profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/account';
  });

  describe('Access Control', () => {
    it('redirects signed-out visitors to login with return destination preserved', async () => {
      mockPathname = '/account';

      render(
        <AuthProvider initialUser={null}>
          <AccountLayout>
            <div>Account Content</div>
          </AccountLayout>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/login?returnTo=%2Faccount');
      });

      expect(screen.queryByText('Account Content')).not.toBeInTheDocument();
    });

    it('renders the account area when visitor is signed in', () => {
      mockPathname = '/account';

      render(
        <AuthProvider initialUser={mockUser}>
          <AccountLayout>
            <div>Account Protected Content</div>
          </AccountLayout>
        </AuthProvider>
      );

      expect(screen.getByText('Account Protected Content')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /Account navigation/i })).toBeInTheDocument();
    });
  });

  describe('Account Navigation', () => {
    it('renders navigation links and marks current page with aria-current="page"', () => {
      mockPathname = '/account';

      render(
        <AuthProvider initialUser={mockUser}>
          <AccountNav />
        </AuthProvider>
      );

      const profileLink = screen.getByRole('link', { name: /Profile/i });
      const addressesLink = screen.getByRole('link', { name: /Addresses/i });
      const ordersLink = screen.getByRole('link', { name: /Orders/i });

      expect(profileLink).toHaveAttribute('href', '/account');
      expect(profileLink).toHaveAttribute('aria-current', 'page');

      expect(addressesLink).toHaveAttribute('href', '/account/addresses');
      expect(addressesLink).not.toHaveAttribute('aria-current');

      expect(ordersLink).toHaveAttribute('href', '/account/orders');
      expect(ordersLink).not.toHaveAttribute('aria-current');
    });

    it('marks addresses page as active when pathname is /account/addresses', () => {
      mockPathname = '/account/addresses';

      render(
        <AuthProvider initialUser={mockUser}>
          <AccountNav />
        </AuthProvider>
      );

      const profileLink = screen.getByRole('link', { name: /Profile/i });
      const addressesLink = screen.getByRole('link', { name: /Addresses/i });

      expect(profileLink).not.toHaveAttribute('aria-current');
      expect(addressesLink).toHaveAttribute('aria-current', 'page');
    });

    it('sign out button triggers logout and redirects to login', async () => {
      vi.spyOn(authApi, 'logout').mockResolvedValue({
        success: true,
        message: 'Logged out successfully',
      });

      render(
        <AuthProvider initialUser={mockUser}>
          <AccountNav />
        </AuthProvider>
      );

      const signoutBtn = screen.getByTestId('account-signout-btn');
      fireEvent.click(signoutBtn);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Profile Page Content', () => {
    it('shows only the fields the API returns', () => {
      render(
        <AuthProvider initialUser={mockUser}>
          <ProfileContent />
        </AuthProvider>
      );

      expect(screen.getByTestId('profile-name')).toHaveTextContent('Ananya Roy');
      expect(screen.getByTestId('profile-email')).toHaveTextContent('ananya@example.com');
      expect(screen.getByTestId('profile-phone')).toHaveTextContent('9876543210');
      expect(screen.getByTestId('profile-member-since')).toHaveTextContent(/May 2026/i);
    });

    it('handles user without optional phone number gracefully', () => {
      const userWithoutPhone: User = {
        id: 'usr-102',
        name: 'Rohan Verma',
        email: 'rohan@example.com',
      };

      render(
        <AuthProvider initialUser={userWithoutPhone}>
          <ProfileContent />
        </AuthProvider>
      );

      expect(screen.getByTestId('profile-name')).toHaveTextContent('Rohan Verma');
      expect(screen.getByTestId('profile-phone')).toHaveTextContent('Not provided');
      expect(screen.getByTestId('profile-member-since')).toHaveTextContent('ID: usr-102');
    });

    it('renders loading state when auth state is loading', () => {
      render(
        <AuthProvider initialUser={null}>
          <ProfileContent />
        </AuthProvider>
      );

      expect(
        screen.getByTestId('profile-error') || screen.getByTestId('profile-loading')
      ).toBeInTheDocument();
    });
  });
});
