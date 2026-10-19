import { FastifyRequest, FastifyReply } from 'fastify';
import { CartService } from '../services/cart-service.js';
import { AddCartItemInput, UpdateCartItemInput } from '../schemas/cart-schemas.js';

export class CartController {
  constructor(private cartService: CartService) {}

  async getCart(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.id;
    const cart = await this.cartService.getCart(userId);
    return reply.status(200).send(cart);
  }

  async addItem(
    req: FastifyRequest<{ Body: AddCartItemInput }>,
    reply: FastifyReply
  ) {
    const userId = req.user!.id;
    const item = await this.cartService.addItem(userId, req.body);
    return reply.status(201).send(item);
  }

  async updateItem(
    req: FastifyRequest<{ Params: { itemId: string }; Body: UpdateCartItemInput }>,
    reply: FastifyReply
  ) {
    const userId = req.user!.id;
    const item = await this.cartService.updateItem(userId, req.params.itemId, req.body);
    return reply.status(200).send(item);
  }

  async deleteItem(
    req: FastifyRequest<{ Params: { itemId: string } }>,
    reply: FastifyReply
  ) {
    const userId = req.user!.id;
    const result = await this.cartService.deleteItem(userId, req.params.itemId);
    return reply.status(200).send(result);
  }
}
