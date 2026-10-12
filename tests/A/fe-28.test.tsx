import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AddressesContent } from '@/app/account/addresses/AddressesContent';
import { AddressForm } from '@/components/account/AddressForm';
import { addressesApi } from '@/lib/api';
import { Address } from '@/lib/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/account/addresses',
  useSearchParams: () => new URLSearchParams(),
}));

const mockAddresses: Address[] = [
  {
    id: 'addr-1',
    recipientName: 'Priya Sharma',
    phone: '9876543210',
    line1: 'Flat 101, Palm Court, Indiranagar',
    line2: '12th Main Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560038',
    isDefault: true,
  },
  {
    id: 'addr-2',
    recipientName: 'Rahul Verma',
    phone: '9812345678',
    line1: 'House 42, Green Park',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110016',
    isDefault: false,
  },
];

describe('FE-28: Saved addresses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AddressForm validation and submission', () => {
    it('validates required fields, 10-digit phone, and 6-digit PIN code before sending', () => {
      const handleSubmit = vi.fn();
      render(<AddressForm onSubmit={handleSubmit} />);

      const submitBtn = screen.getByTestId('address-submit-btn');
      fireEvent.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Recipient name is required.')).toBeInTheDocument();
      expect(document.activeElement).toBe(screen.getByLabelText(/Full Name \/ Recipient/i));

      // Fill name but invalid phone
      const nameInput = screen.getByLabelText(/Full Name \/ Recipient/i);
      fireEvent.change(nameInput, { target: { value: 'Aarav Patel' } });
      const phoneInput = screen.getByLabelText(/^Phone Number/i);
      fireEvent.change(phoneInput, { target: { value: '123' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Please enter a valid 10-digit Indian mobile number/i)).toBeInTheDocument();

      // Valid phone, invalid PIN code
      fireEvent.change(phoneInput, { target: { value: '9876543210' } });
      const line1Input = screen.getByLabelText(/Line 1/i);
      fireEvent.change(line1Input, { target: { value: 'Sector 5' } });
      const cityInput = screen.getByLabelText(/City \/ Town/i);
      fireEvent.change(cityInput, { target: { value: 'Mumbai' } });
      const stateInput = screen.getByLabelText(/State/i);
      fireEvent.change(stateInput, { target: { value: 'Maharashtra' } });
      const pinInput = screen.getByLabelText(/6-Digit PIN Code/i);
      fireEvent.change(pinInput, { target: { value: '400' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Please enter a valid 6-digit PIN code/i)).toBeInTheDocument();

      // Fix PIN code and submit
      fireEvent.change(pinInput, { target: { value: '400001' } });
      fireEvent.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalledWith({
        recipientName: 'Aarav Patel',
        phone: '9876543210',
        line1: 'Sector 5',
        line2: undefined,
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        isDefault: false,
      });
    });

    it('displays server field errors next to the fields', () => {
      render(
        <AddressForm
          onSubmit={vi.fn()}
          serverFieldErrors={{
            pinCode: 'Delivery is currently not available to this PIN code.',
            phone: 'Mobile number already registered.',
          }}
        />
      );

      expect(
        screen.getByText('Delivery is currently not available to this PIN code.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Mobile number already registered.')
      ).toBeInTheDocument();
    });
  });

  describe('Address List and Actions', () => {
    it('renders empty state inviting customer to add their first address when list is empty', async () => {
      vi.spyOn(addressesApi, 'getAddresses').mockResolvedValue([]);

      render(<AddressesContent />);

      await waitFor(() => {
        expect(screen.getByTestId('addresses-empty-state')).toBeInTheDocument();
      });

      expect(screen.getByText('No Saved Addresses Yet')).toBeInTheDocument();
      expect(screen.getByTestId('empty-add-address-btn')).toBeInTheDocument();

      // Clicking Add opens the form modal
      fireEvent.click(screen.getByTestId('empty-add-address-btn'));
      expect(screen.getByText('Add Delivery Address')).toBeInTheDocument();
    });

    it('renders address cards with details and marks default address', async () => {
      vi.spyOn(addressesApi, 'getAddresses').mockResolvedValue([...mockAddresses]);

      render(<AddressesContent />);

      await waitFor(() => {
        expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
      });

      expect(screen.getByText('Rahul Verma')).toBeInTheDocument();
      expect(screen.getByTestId('default-badge')).toBeInTheDocument();
      expect(screen.getByText(/560038/)).toBeInTheDocument();
      expect(screen.getByText(/110016/)).toBeInTheDocument();
    });

    it('setting default address calls API and updates list from response', async () => {
      vi.spyOn(addressesApi, 'getAddresses')
        .mockResolvedValueOnce([...mockAddresses])
        .mockResolvedValueOnce([
          { ...mockAddresses[0], isDefault: false },
          { ...mockAddresses[1], isDefault: true },
        ]);

      const editSpy = vi.spyOn(addressesApi, 'editAddress').mockResolvedValue({
        ...mockAddresses[1],
        isDefault: true,
      });

      render(<AddressesContent />);

      await waitFor(() => {
        expect(screen.getByTestId('set-default-btn-addr-2')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('set-default-btn-addr-2'));

      await waitFor(() => {
        expect(editSpy).toHaveBeenCalledWith('addr-2', { isDefault: true });
        expect(screen.queryByTestId('set-default-btn-addr-2')).not.toBeInTheDocument();
      });
    });

    it('delete asks for confirmation, cancels safely, and deletes on confirmation', async () => {
      vi.spyOn(addressesApi, 'getAddresses').mockResolvedValue([...mockAddresses]);
      const deleteSpy = vi.spyOn(addressesApi, 'deleteAddress').mockResolvedValue({
        success: true,
        message: 'Deleted',
      });

      render(<AddressesContent />);

      await waitFor(() => {
        expect(screen.getByTestId('delete-address-btn-addr-2')).toBeInTheDocument();
      });

      // 1. Click delete opens confirmation
      fireEvent.click(screen.getByTestId('delete-address-btn-addr-2'));
      expect(screen.getByTestId('delete-confirmation-content')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete the address for/i)).toBeInTheDocument();

      // 2. Cancel closes modal without deleting
      const cancelBtn = screen.getByRole('button', { name: /^Cancel$/i });
      fireEvent.click(cancelBtn);
      expect(deleteSpy).not.toHaveBeenCalled();

      // 3. Reopen and confirm
      fireEvent.click(screen.getByTestId('delete-address-btn-addr-2'));
      const confirmDeleteBtn = screen.getByTestId('confirm-delete-btn');
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith('addr-2');
      });
    });

    it('handles add address submission and updates list', async () => {
      vi.spyOn(addressesApi, 'getAddresses').mockResolvedValue([...mockAddresses]);
      const addSpy = vi.spyOn(addressesApi, 'addAddress').mockResolvedValue({
        id: 'addr-new',
        recipientName: 'Kavita Joshi',
        phone: '9876543210',
        line1: 'B-201, Green Heights',
        city: 'Pune',
        state: 'Maharashtra',
        pinCode: '411001',
        isDefault: false,
      });

      render(<AddressesContent />);

      await waitFor(() => {
        expect(screen.getByTestId('add-address-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('add-address-btn'));
      expect(screen.getByText('Add Delivery Address')).toBeInTheDocument();

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/Full Name \/ Recipient/i), {
        target: { value: 'Kavita Joshi' },
      });
      fireEvent.change(screen.getByLabelText(/^Phone Number/i), {
        target: { value: '9876543210' },
      });
      fireEvent.change(screen.getByLabelText(/Line 1/i), {
        target: { value: 'B-201, Green Heights' },
      });
      fireEvent.change(screen.getByLabelText(/City \/ Town/i), {
        target: { value: 'Pune' },
      });
      fireEvent.change(screen.getByLabelText(/State/i), {
        target: { value: 'Maharashtra' },
      });
      fireEvent.change(screen.getByLabelText(/6-Digit PIN Code/i), {
        target: { value: '411001' },
      });

      fireEvent.click(screen.getByTestId('address-submit-btn'));

      await waitFor(() => {
        expect(addSpy).toHaveBeenCalled();
      });
    });
  });
});
