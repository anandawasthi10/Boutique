import { AddressRepository } from '../repositories/address-repository.js';
import { CreateAddressInput, UpdateAddressInput } from '../schemas/address-schemas.js';
import { NotFoundError } from '../errors/app-error.js';

export class AddressService {
  constructor(private addressRepo: AddressRepository) {}

  async listAddresses(userId: string) {
    return this.addressRepo.listByUserId(userId);
  }

  async getAddress(id: string, userId: string) {
    const address = await this.addressRepo.findById(id, userId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }
    return address;
  }

  async createAddress(userId: string, data: CreateAddressInput) {
    return this.addressRepo.create(userId, data);
  }

  async updateAddress(id: string, userId: string, data: UpdateAddressInput) {
    const updated = await this.addressRepo.update(id, userId, data);
    if (!updated) {
      throw new NotFoundError('Address not found');
    }
    return updated;
  }

  async deleteAddress(id: string, userId: string) {
    const deleted = await this.addressRepo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError('Address not found');
    }
    return { success: true };
  }
}
