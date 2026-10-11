import { Metadata } from 'next';
import { AccountLayout } from '@/components/account';
import { ProfileContent } from './ProfileContent';

export const metadata: Metadata = {
  title: 'My Profile | Account',
  description: 'View your account and profile details.',
};

export default function AccountProfilePage() {
  return (
    <AccountLayout
      title="My Account"
      description="View and manage your account details, address book, and recent orders."
    >
      <ProfileContent />
    </AccountLayout>
  );
}
