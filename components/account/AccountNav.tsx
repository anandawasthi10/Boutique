'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User as UserIcon, MapPin, Package, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exactMatch?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Profile',
    href: '/account',
    icon: UserIcon,
    exactMatch: true,
  },
  {
    name: 'Addresses',
    href: '/account/addresses',
    icon: MapPin,
  },
  {
    name: 'Orders',
    href: '/account/orders',
    icon: Package,
  },
];

export const AccountNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isItemActive = (item: NavItem): boolean => {
    if (!pathname) return false;
    if (item.exactMatch) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      aria-label="Account navigation"
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-4 sm:p-5 flex flex-col gap-2"
    >
      {/* User greeting if user loaded */}
      {user && (
        <div className="pb-4 mb-2 border-b border-[var(--color-border)] px-3">
          <p className="text-caption uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
            Signed in as
          </p>
          <p className="text-body font-semibold text-[var(--color-text)] truncate mt-0.5">
            {user.name}
          </p>
          <p className="text-caption text-[var(--color-text-muted)] truncate">
            {user.email}
          </p>
        </div>
      )}

      {/* Nav links */}
      <ul className="flex flex-col gap-1 list-none p-0 m-0">
        {NAV_ITEMS.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-body-small font-medium transition-colors duration-150 ${
                  active
                    ? 'bg-[var(--color-surface-alt)] text-[var(--color-primary)] font-semibold'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}

        {/* Sign Out Button */}
        <li className="pt-2 mt-2 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-body-small font-medium text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-bg)] transition-colors duration-150 cursor-pointer text-left"
            data-testid="account-signout-btn"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};
