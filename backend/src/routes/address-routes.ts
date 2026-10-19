import { FastifyInstance } from 'fastify';
import { AddressController } from '../controllers/address-controller.js';
import {
  CreateAddressSchema,
  UpdateAddressSchema,
  AddressParamsSchema,
} from '../schemas/address-schemas.js';
import { validate } from '../middleware/validate.js';

export function registerAddressRoutes(
  app: FastifyInstance,
  controller: AddressController,
  authenticateCustomer: any
): void {
  // 1. List user addresses
  app.get(
    '/api/v1/addresses',
    { preHandler: [authenticateCustomer] },
    controller.list.bind(controller)
  );

  // 2. Get address by id
  app.get(
    '/api/v1/addresses/:id',
    {
      preHandler: [
        authenticateCustomer,
        validate({ params: AddressParamsSchema }),
      ],
    },
    controller.getById.bind(controller)
  );

  // 3. Create address
  app.post(
    '/api/v1/addresses',
    {
      preHandler: [
        authenticateCustomer,
        validate({ body: CreateAddressSchema }),
      ],
    },
    controller.create.bind(controller)
  );

  // 4. Update address
  app.patch(
    '/api/v1/addresses/:id',
    {
      preHandler: [
        authenticateCustomer,
        validate({
          params: AddressParamsSchema,
          body: UpdateAddressSchema,
        }),
      ],
    },
    controller.update.bind(controller)
  );

  // 5. Delete address
  app.delete(
    '/api/v1/addresses/:id',
    {
      preHandler: [
        authenticateCustomer,
        validate({ params: AddressParamsSchema }),
      ],
    },
    controller.delete.bind(controller)
  );
}
