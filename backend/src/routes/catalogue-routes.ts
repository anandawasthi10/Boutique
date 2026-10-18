import { FastifyInstance } from 'fastify';
import { CatalogueController } from '../controllers/catalogue-controller.js';
import { validate } from '../middleware/validate.js';
import { productsQuerySchema, quoteBodySchema } from '../schemas/catalogue-schemas.js';

export function registerCatalogueRoutes(
  app: FastifyInstance,
  controller: CatalogueController
): void {
  // Categories list
  app.get('/api/v1/categories', controller.getCategories);

  // Products list with filtering & pagination
  app.get(
    '/api/v1/products',
    { preHandler: [validate({ query: productsQuerySchema })] },
    controller.getProducts
  );

  // Product detail by ID or Slug (CG-01)
  app.get('/api/v1/products/:id', controller.getProductDetail);

  // Quote endpoint (Build Your Own)
  app.post(
    '/api/v1/products/:id/quote',
    { preHandler: [validate({ body: quoteBodySchema })] },
    controller.quote
  );
}
