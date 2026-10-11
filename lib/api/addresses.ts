import { apiFetch } from './client';
import type { Address, AddressInput, SimpleSuccessResponse } from '../types';

export async function getAddresses(): Promise<Address[]> {
  return apiFetch<Address[]>('/addresses', {
    method: 'GET',
  });
}

export async function addAddress(address: AddressInput): Promise<Address> {
  return apiFetch<Address>('/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  });
}

export async function editAddress(id: string, address: Partial<AddressInput>): Promise<Address> {
  return apiFetch<Address>(`/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(address),
  });
}

export async function deleteAddress(id: string): Promise<SimpleSuccessResponse> {
  return apiFetch<SimpleSuccessResponse>(`/addresses/${id}`, {
    method: 'DELETE',
  });
}
