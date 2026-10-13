'use client';

import React, { useState } from 'react';
import { Address, AddressInput } from '@/lib/types';
import { addressesApi, ApiException } from '@/lib/api';
import { AddressForm } from '@/components/account/AddressForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus, MapPin, Check } from 'lucide-react';

export interface AddressSelectionStepProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (address: Address) => void;
  onAddressAdded: (newAddress: Address) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

export const AddressSelectionStep: React.FC<AddressSelectionStepProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddressAdded,
  onContinue,
  isLoading = false,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setFormError(null);
    setFormFieldErrors({});
    setIsAddModalOpen(true);
  };

  const handleCloseAdd = () => {
    if (isSubmitting) return;
    setIsAddModalOpen(false);
    setFormError(null);
    setFormFieldErrors({});
  };

  const handleAddNewAddress = async (data: AddressInput) => {
    setIsSubmitting(true);
    setFormError(null);
    setFormFieldErrors({});

    try {
      const created = await addressesApi.addAddress(data);
      onAddressAdded(created);
      onSelectAddress(created);
      setIsAddModalOpen(false);
    } catch (err) {
      if (err instanceof ApiException && err.fieldErrors) {
        setFormFieldErrors(err.fieldErrors);
      } else {
        const msg = err instanceof Error ? err.message : 'Unable to add delivery address.';
        setFormError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-h3 font-serif text-[var(--color-text)] mb-1">
            Delivery Address
          </h2>
          <p className="text-body-small text-[var(--color-text-muted)]">
            Choose where you would like your handcrafted accessories delivered.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleOpenAdd}
          className="shrink-0"
          data-testid="checkout-add-address-btn"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Address</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          <div className="h-36 bg-[var(--color-border)]/40 rounded-[4px]" />
          <div className="h-36 bg-[var(--color-border)]/40 rounded-[4px]" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-10 h-10 mx-auto text-[var(--color-text-muted)] mb-3" />
          <p className="text-body font-medium text-[var(--color-text)] mb-1">
            No saved addresses found
          </p>
          <p className="text-body-small text-[var(--color-text-muted)] mb-5">
            Please add a delivery address to proceed with your order.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenAdd}
            data-testid="checkout-empty-add-address-btn"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Delivery Address</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Select delivery address">
          {addresses.map((address) => {
            const isSelected = address.id === selectedAddressId;

            return (
              <label
                key={address.id}
                htmlFor={`checkout-address-${address.id}`}
                className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-[4px] border cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)] bg-[var(--color-bg)]'
                }`}
                data-testid={`checkout-address-option-${address.id}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`checkout-address-${address.id}`}
                        name="checkout-selected-address"
                        value={address.id}
                        checked={isSelected}
                        onChange={() => onSelectAddress(address)}
                        className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                      />
                      <span className="font-semibold text-body text-[var(--color-text)]">
                        {address.recipientName}
                      </span>
                    </div>

                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] uppercase tracking-wider">
                        <Check className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="text-body-small text-[var(--color-text-muted)] pl-6 space-y-0.5 leading-relaxed">
                    <p className="text-[var(--color-text)]">{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.state} - {address.pinCode}
                    </p>
                    <p className="text-xs pt-1">{address.phone}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* Continue Action */}
      {addresses.length > 0 && (
        <div className="flex justify-end pt-6 mt-8 border-t border-[var(--color-border)]">
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={!selectedAddress}
            onClick={onContinue}
            data-testid="continue-to-review-btn"
          >
            <span>Continue to Review</span>
          </Button>
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAdd}
        title="Add Delivery Address"
        maxWidth="lg"
      >
        <AddressForm
          onSubmit={handleAddNewAddress}
          onCancel={handleCloseAdd}
          isSubmitting={isSubmitting}
          serverError={formError}
          serverFieldErrors={formFieldErrors}
          submitLabel="Save and Select Address"
        />
      </Modal>
    </div>
  );
};
