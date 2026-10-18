import { FastifyRequest, FastifyReply } from 'fastify';
import { CatalogueService } from '../services/catalogue-service.js';
import { ProductsQueryParams, QuoteInput } from '../schemas/catalogue-schemas.js';

export class CatalogueController {
  constructor(private catalogueService: CatalogueService) {}

  getCategories = async (_request: FastifyRequest, reply: FastifyReply) => {
    const categories = await this.catalogueService.getCategories();
    return reply.status(200).send(categories);
  };

  getProducts = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as ProductsQueryParams;
    const result = await this.catalogueService.getProducts(query);
    return reply.status(200).send(result);
  };

  getProductDetail = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id?: string; slug?: string };
    const identifier = params.id || params.slug!;
    const product = await this.catalogueService.getProductDetail(identifier);
    return reply.status(200).send(product);
  };

  quote = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const body = request.body as QuoteInput;
    const quoteResult = await this.catalogueService.calculateQuote(params.id, body);
    return reply.status(200).send(quoteResult);
  };
}
