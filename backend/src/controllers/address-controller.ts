import { FastifyRequest, FastifyReply } from 'fastify';
import { AddressService } from '../services/address-service.js';
import {
  CreateAddressInput,
  UpdateAddressInput,
} from '../schemas/address-schemas.js';

export class AddressController {
  constructor(private addressService: AddressService) {}

  async list(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.id;
    const addresses = await this.addressService.listAddresses(userId);
    return reply.status(200).send(addresses);
  }

  async getById(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = req.user!.id;
    const address = await this.addressService.getAddress(req.params.id, userId);
    return reply.status(200).send(address);
  }

  async create(
    req: FastifyRequest<{ Body: CreateAddressInput }>,
    reply: FastifyReply
  ) {
    const userId = req.user!.id;
    const created = await this.addressService.createAddress(userId, req.body);
    return reply.status(201).send(created);
  }

  async update(
    req: FastifyRequest<{ Params: { id: string }; Body: UpdateAddressInput }>,
    reply: FastifyReply
  ) {
    const userId = req.user!.id;
    const updated = await this.addressService.updateAddress(req.params.id, userId, req.body);
    return reply.status(200).send(updated);
  }

  async delete(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = req.user!.id;
    const result = await this.addressService.deleteAddress(req.params.id, userId);
    return reply.status(200).send(result);
  }
}
