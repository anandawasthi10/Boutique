'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Address, AddressInput } from '@/lib/types';
import { addressesApi, ApiException } from '@/lib/api';
import { AddressCard } from '@/components/account/AddressCard';
import { AddressForm } from '@/components/account/AddressForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus, MapPin, AlertCircle, Trash2 } from 'lucide-react';

export const AddressesContent: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Add / Edit Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string>>({});

  // Delete Confirmation Modal state
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Setting Default state
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await addressesApi.getAddresses();
      setAddresses(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load addresses.';
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    addressesApi
      .getAddresses()
      .then((data) => {
        if (isMounted) {
          setAddresses(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load addresses.';
          setFetchError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Open Form
  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormError(null);
    setFormFieldErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setFormError(null);
    setFormFieldErrors({});
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (isSubmittingForm) return;
    setIsFormOpen(false);
    setEditingAddress(null);
    setFormError(null);
    setFormFieldErrors({});
  };

  // Save Form (Add or Edit)
  const handleFormSubmit = async (input: AddressInput) => {
    setIsSubmittingForm(true);
    setFormError(null);
    setFormFieldErrors({});

    try {
      if (editingAddress) {
        await addressesApi.editAddress(editingAddress.id, input);
      } else {
        await addressesApi.addAddress(input);
      }
      setIsFormOpen(false);
      setEditingAddress(null);
      await loadAddresses();
    } catch (err) {
      if (err instanceof ApiException && err.fieldErrors) {
        setFormFieldErrors(err.fieldErrors);
      } else {
        const msg = err instanceof Error ? err.message : 'Unable to save address.';
        setFormError(msg);
      }
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Set as Default
  const handleSetDefault = async (address: Address) => {
    if (settingDefaultId) return;
    setSettingDefaultId(address.id);
    try {
      await addressesApi.editAddress(address.id, { isDefault: true });
      await loadAddresses();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not set as default.';
      setFetchError(msg);
    } finally {
      setSettingDefaultId(null);
    }
  };

  // Delete flow
  const handleOpenDelete = (address: Address) => {
    setAddressToDelete(address);
    setDeleteError(null);
  };

  const handleCloseDelete = () => {
    if (isDeleting) return;
    setAddressToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await addressesApi.deleteAddress(addressToDelete.id);
      setAddressToDelete(null);
      await loadAddresses();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to delete address.';
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-5 sm:p-6">
        <div>
          <h2 className="text-h3 font-serif text-[var(--color-text)] mb-1">
            Saved Addresses
          </h2>
          <p className="text-body-small text-[var(--color-text-muted)]">
            Manage your delivery destinations for bespoke orders.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={handleOpenAdd}
          className="shrink-0"
          data-testid="add-address-btn"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Address</span>
        </Button>
      </div>

      {/* Global Error Banner */}
      {fetchError && (
        <div
          role="alert"
          data-testid="addresses-error-banner"
          className="p-4 rounded-[4px] bg-error/10 border border-error/20 flex items-start justify-between gap-3 text-xs text-[var(--color-error)]"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={loadAddresses}
            className="font-semibold underline hover:no-underline cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content States */}
      {isLoading ? (
        /* Loading Skeleton */
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse"
          data-testid="addresses-loading"
          role="status"
          aria-label="Loading addresses"
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-6 h-48" />
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-6 h-48" />
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <div
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-8 sm:p-12 text-center"
          data-testid="addresses-empty-state"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-h3 font-serif text-[var(--color-text)] mb-2">
            No Saved Addresses Yet
          </h3>
          <p className="text-body-small text-[var(--color-text-muted)] max-w-md mx-auto mb-6 leading-relaxed">
            You don&apos;t have any saved delivery addresses. Add your first address to streamline your checkout experience.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenAdd}
            data-testid="empty-add-address-btn"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Your First Address</span>
          </Button>
        </div>
      ) : (
        /* Address Cards Grid */
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-testid="addresses-list"
        >
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onSetDefault={handleSetDefault}
              isSettingDefault={settingDefaultId === address.id}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
        maxWidth="lg"
      >
        <AddressForm
          initialAddress={editingAddress}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmittingForm}
          serverError={formError}
          serverFieldErrors={formFieldErrors}
          submitLabel={editingAddress ? 'Save Changes' : 'Save Address'}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(addressToDelete)}
        onClose={handleCloseDelete}
        title="Delete Address"
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="text"
              disabled={isDeleting}
              onClick={handleCloseDelete}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isDeleting}
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-[var(--color-error)] hover:bg-[#8F2824] text-white"
              data-testid="confirm-delete-btn"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>Delete Address</span>
            </Button>
          </div>
        }
      >
        <div className="text-left py-2" data-testid="delete-confirmation-content">
          {deleteError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-[4px] bg-error/10 border border-error/20 text-xs text-[var(--color-error)] flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}
          <p className="text-body-small text-[var(--color-text-muted)] leading-relaxed">
            Are you sure you want to delete the address for{' '}
            <strong className="text-[var(--color-text)]">
              {addressToDelete?.recipientName}
            </strong>
            ? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};
