import { FastifyInstance } from 'fastify';
import { CartController } from '../controllers/cart-controller.js';
import {
  AddCartItemSchema,
  UpdateCartItemSchema,
  CartItemParamsSchema,
} from '../schemas/cart-schemas.js';
import { validate } from '../middleware/validate.js';

export function registerCartRoutes(
  app: FastifyInstance,
  controller: CartController,
  authenticateCustomer: any
): void {
  // 1. Read cart
  app.get(
    '/api/v1/cart',
    { preHandler: [authenticateCustomer] },
    controller.getCart.bind(controller)
  );

  // 2. Add item to cart
  app.post(
    '/api/v1/cart/items',
    {
      preHandler: [
        authenticateCustomer,
        validate({ body: AddCartItemSchema }),
      ],
    },
    controller.addItem.bind(controller)
  );

  // 3. Edit item in cart
  app.patch(
    '/api/v1/cart/items/:itemId',
    {
      preHandler: [
        authenticateCustomer,
        validate({
          params: CartItemParamsSchema,
          body: UpdateCartItemSchema,
        }),
      ],
    },
    controller.updateItem.bind(controller)
  );

  // 4. Remove item from cart
  app.delete(
    '/api/v1/cart/items/:itemId',
    {
      preHandler: [
        authenticateCustomer,
        validate({ params: CartItemParamsSchema }),
      ],
    },
    controller.deleteItem.bind(controller)
  );
}
