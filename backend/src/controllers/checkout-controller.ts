import { FastifyRequest, FastifyReply } from 'fastify';
import { CheckoutService } from '../services/checkout-service.js';
import { PaymentService } from '../services/payment-service.js';
import { CheckoutBodyInput, OrdersQueryInput } from '../schemas/checkout-schemas.js';

export class CheckoutController {
  constructor(
    private checkoutService: CheckoutService,
    private paymentService: PaymentService
  ) {}

  async checkout(
    req: FastifyRequest<{ Body: CheckoutBodyInput }>,
    reply: FastifyReply
  ) {
    const userId = req.user!.id;
    const idempotencyKey = (req.headers['idempotency-key'] as string) || undefined;
    const { statusCode, payload } = await this.checkoutService.checkout(
      userId,
      req.body.addressId,
      idempotencyKey
    );
    return reply.status(statusCode).send(payload);
  }

  async listOrders(
    req: FastifyRequest<{ Querystring: OrdersQueryInput }>,
    reply: FastifyReply
  ) {
    const userId = req.user!.id;
    const { page, pageSize } = req.query;
    const orders = await this.checkoutService.listUserOrders(userId, page, pageSize);
    return reply.status(200).send(orders);
  }

  async getOrderById(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = req.user!.id;
    const order = await this.checkoutService.getOrderById(req.params.id, userId);
    return reply.status(200).send(order);
  }

  async handleWebhook(req: FastifyRequest, reply: FastifyReply) {
    // Fastify request can have string or object body
    const rawBody =
      typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body);

    const result = await this.paymentService.handleWebhook(rawBody, req.headers);
    return reply.status(200).send(result);
  }
}
