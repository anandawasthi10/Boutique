import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { sanitizeReturnUrl } from '@/lib/utils/url';
import { CartProvider, useCart } from '@/lib/hooks/useCart';
import { authApi } from '@/lib/api';
import { User, Cart } from '@/lib/types';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockPathname = '/account/orders';
let mockSearchParams = new URLSearchParams('page=2');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe('FE-24: Auth state and protected pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/account/orders';
    mockSearchParams = new URLSearchParams('page=2');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides current user and loading state to any consumer component', async () => {
    const mockUser: User = {
      id: 'usr-1',
      name: 'Priya Sharma',
      email: 'priya@example.com',
    };

    vi.spyOn(authApi, 'getCurrentUser').mockResolvedValue(mockUser);

    const Consumer = () => {
      const { user, isLoading, isAuthenticated } = useAuth();
      if (isLoading) return <div data-testid="auth-loading">Loading session...</div>;
      return (
        <div>
          <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Guest'}</div>
          <div data-testid="user-name">{user?.name}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    // Initial loading state
    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();

    // Loaded state
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Priya Sharma');
    });
  });

  it('redirects signed-out visitors visiting a protected page to login with preserved returnTo query', async () => {
    vi.spyOn(authApi, 'getCurrentUser').mockResolvedValue(null);

    const ProtectedContent = () => (
      <ProtectedRoute>
        <div data-testid="secret-content">Secret Account Details</div>
      </ProtectedRoute>
    );

    render(
      <AuthProvider>
        <ProtectedContent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/login?returnTo=%2Faccount%2Forders%3Fpage%3D2'
      );
    });

    expect(screen.queryByTestId('secret-content')).not.toBeInTheDocument();
  });

  it('renders children on protected route when user is authenticated', async () => {
    const mockUser: User = {
      id: 'usr-2',
      name: 'Aditi Rao',
      email: 'aditi@example.com',
    };

    const ProtectedContent = () => (
      <ProtectedRoute>
        <div data-testid="secret-content">Secret Account Details</div>
      </ProtectedRoute>
    );

    render(
      <AuthProvider initialUser={mockUser}>
        <ProtectedContent />
      </AuthProvider>
    );

    expect(screen.getByTestId('secret-content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  describe('sanitizeReturnUrl', () => {
    it('accepts safe relative paths on this site', () => {
      expect(sanitizeReturnUrl('/account')).toBe('/account');
      expect(sanitizeReturnUrl('/checkout?step=address')).toBe('/checkout?step=address');
      expect(sanitizeReturnUrl('/product/classic-scrunchie#reviews')).toBe('/product/classic-scrunchie#reviews');
    });

    it('rejects external URLs, protocol-relative paths, and dangerous schemes', () => {
      expect(sanitizeReturnUrl('https://evil.com')).toBe('/account');
      expect(sanitizeReturnUrl('http://phishing.example.com/login')).toBe('/account');
      expect(sanitizeReturnUrl('//attacker.com')).toBe('/account');
      expect(sanitizeReturnUrl('/\\attacker.com')).toBe('/account');
      expect(sanitizeReturnUrl('javascript:alert(1)')).toBe('/account');
      expect(sanitizeReturnUrl('data:text/html,evil')).toBe('/account');
      expect(sanitizeReturnUrl(null)).toBe('/account');
      expect(sanitizeReturnUrl(undefined)).toBe('/account');
      expect(sanitizeReturnUrl('')).toBe('/account');
    });
  });

  it('does not store passwords, tokens or session secrets in browser storage', async () => {
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    const sessionStorageSpy = vi.spyOn(Storage.prototype, 'setItem');

    const mockUser: User = {
      id: 'usr-1',
      name: 'User',
      email: 'test@example.com',
    };

    vi.spyOn(authApi, 'login').mockResolvedValue(mockUser);

    const LoginTest = () => {
      const { login } = useAuth();
      return (
        <button
          onClick={() => login({ email: 'test@example.com', password: 'SecretPassword123' })}
        >
          Sign In
        </button>
      );
    };

    render(
      <AuthProvider initialUser={null}>
        <LoginTest />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalled();
    });

    // Check no storage calls stored secrets
    expect(localStorageSpy).not.toHaveBeenCalledWith(
      expect.stringMatching(/password|token|secret|session/i),
      expect.anything()
    );
    expect(sessionStorageSpy).not.toHaveBeenCalledWith(
      expect.stringMatching(/password|token|secret|session/i),
      expect.anything()
    );
  });

  it('logout clears both the user and the cart state', async () => {
    const mockUser: User = {
      id: 'usr-logout',
      name: 'Logout Test',
      email: 'logout@example.com',
    };

    const initialCart: Cart = {
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          productName: 'Scrunchie',
          image: '/image.svg',
          selectedOptions: [],
          quantity: 2,
          unitPrice: 200,
          lineTotal: 400,
          status: 'available',
        },
      ],
      subtotal: 400,
      total: 400,
    };

    vi.spyOn(authApi, 'logout').mockResolvedValue({ success: true });

    const CombinedConsumer = () => {
      const { user, logout } = useAuth();
      const { cart } = useCart();
      return (
        <div>
          <div data-testid="user-display">{user ? user.name : 'No User'}</div>
          <div data-testid="cart-count">{cart?.items.length ?? 0}</div>
          <button onClick={() => logout()}>Log Out</button>
        </div>
      );
    };

    render(
      <AuthProvider initialUser={mockUser}>
        <CartProvider initialCart={initialCart}>
          <CombinedConsumer />
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('user-display')).toHaveTextContent('Logout Test');
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));

    await waitFor(() => {
      expect(screen.getByTestId('user-display')).toHaveTextContent('No User');
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });
  });
});
