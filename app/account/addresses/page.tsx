import { Metadata } from 'next';
import { AccountLayout } from '@/components/account';
import { AddressesContent } from './AddressesContent';

export const metadata: Metadata = {
  title: 'Saved Addresses | Account',
  description: 'Manage your delivery address book for handcrafted accessory orders.',
};

export default function AddressesPage() {
  return (
    <AccountLayout
      title="Saved Addresses"
      description="Manage your delivery addresses and set your default destination for checkout."
    >
      <AddressesContent />
    </AccountLayout>
  );
}
