import { Address, AddressInput, SimpleSuccessResponse } from '../../types';
import { ApiException } from '../client';
import { INITIAL_ADDRESSES } from './data';

const addressesStore: Address[] = JSON.parse(JSON.stringify(INITIAL_ADDRESSES));

export function setMockAddresses(addresses: Address[]): void {
  addressesStore.length = 0;
  addressesStore.push(...JSON.parse(JSON.stringify(addresses)));
}

export async function getAddresses(): Promise<Address[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(addressesStore)));
    }, 10);
  });
}

export async function addAddress(input: AddressInput): Promise<Address> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!input.recipientName || !input.phone || !input.line1 || !input.city || !input.state || !input.pinCode) {
        reject(
          new ApiException({
            code: 'VALIDATION_ERROR',
            message: 'All required address fields must be filled.',
          })
        );
        return;
      }

      if (input.isDefault) {
        addressesStore.forEach((a) => {
          a.isDefault = false;
        });
      }

      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        recipientName: input.recipientName,
        phone: input.phone,
        line1: input.line1,
        line2: input.line2,
        city: input.city,
        state: input.state,
        pinCode: input.pinCode,
        isDefault: Boolean(input.isDefault || addressesStore.length === 0),
      };

      addressesStore.push(newAddress);
      resolve({ ...newAddress });
    }, 15);
  });
}

export async function editAddress(id: string, update: Partial<AddressInput>): Promise<Address> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const addr = addressesStore.find((a) => a.id === id);
      if (!addr) {
        reject(
          new ApiException({
            code: 'ADDRESS_NOT_FOUND',
            message: 'The requested address was not found.',
          })
        );
        return;
      }

      if (update.isDefault) {
        addressesStore.forEach((a) => {
          a.isDefault = false;
        });
      }

      Object.assign(addr, update);
      resolve({ ...addr });
    }, 15);
  });
}

export async function deleteAddress(id: string): Promise<SimpleSuccessResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = addressesStore.findIndex((a) => a.id === id);
      if (idx === -1) {
        reject(
          new ApiException({
            code: 'ADDRESS_NOT_FOUND',
            message: 'Address not found to delete.',
          })
        );
        return;
      }

      addressesStore.splice(idx, 1);
      // If deleted address was default and other addresses exist, set first as default
      if (addressesStore.length > 0 && !addressesStore.some((a) => a.isDefault)) {
        addressesStore[0].isDefault = true;
      }

      resolve({ success: true, message: 'Address removed successfully.' });
    }, 15);
  });
}
