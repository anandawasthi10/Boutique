import { FastifyInstance } from 'fastify';
import { CheckoutController } from '../controllers/checkout-controller.js';
import { validate } from '../middleware/validate.js';
import {
  CheckoutBodySchema,
  OrdersQuerySchema,
  OrderIdParamSchema,
} from '../schemas/checkout-schemas.js';

export function registerCheckoutRoutes(
  app: FastifyInstance,
  controller: CheckoutController,
  authenticate: any
) {
  // Customer checkout
  app.post(
    '/api/v1/checkout',
    {
      preHandler: [authenticate, validate({ body: CheckoutBodySchema })],
    },
    controller.checkout.bind(controller)
  );

  // Customer order listing
  app.get(
    '/api/v1/orders',
    {
      preHandler: [authenticate, validate({ query: OrdersQuerySchema })],
    },
    controller.listOrders.bind(controller)
  );

  // Customer order detail
  app.get(
    '/api/v1/orders/:id',
    {
      preHandler: [authenticate, validate({ params: OrderIdParamSchema })],
    },
    controller.getOrderById.bind(controller)
  );

  // Payment Webhook (Public, raw body verification handled in service)
  app.post(
    '/api/v1/payments/webhook',
    controller.handleWebhook.bind(controller)
  );
}
