import {
  Product,
  ProductsQueryParams,
  ProductsResponse,
  PriceQuote,
  PriceQuoteRequest,
  PriceQuoteLine,
  PriceQuoteProblem,
  Option,
} from '../../types';
import { ApiException } from '../client';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from './data';

export async function getProducts(params: ProductsQueryParams = {}): Promise<ProductsResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...MOCK_PRODUCTS];

      // Category filter
      if (params.category) {
        const catQuery = params.category.toLowerCase();
        const matchedCat = MOCK_CATEGORIES.find(
          (c) => c.id.toLowerCase() === catQuery || c.slug.toLowerCase() === catQuery || c.name.toLowerCase() === catQuery
        );
        const catId = matchedCat ? matchedCat.id.toLowerCase() : catQuery;
        filtered = filtered.filter(
          (p) =>
            p.category.id.toLowerCase() === catId ||
            p.category.name.toLowerCase() === catQuery
        );
      }

      // Search filter
      if (params.search && params.search.trim() !== '') {
        const query = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
      }

      // CONTRACT-GAP (CG-03): Fabric filter assumed to inspect swatch option groups
      if (params.fabric) {
        filtered = filtered.filter((p) =>
          p.optionGroups.some(
            (g) =>
              g.type === 'swatch' &&
              g.options.some((o) => o.label.toLowerCase() === params.fabric?.toLowerCase())
          )
        );
      }

      // Price filter
      if (params.priceMin !== undefined) {
        filtered = filtered.filter((p) => p.basePrice >= (params.priceMin ?? 0));
      }
      if (params.priceMax !== undefined) {
        filtered = filtered.filter((p) => p.basePrice <= (params.priceMax ?? Infinity));
      }

      // Sorting
      if (params.sort) {
        if (params.sort === 'price_asc') {
          filtered.sort((a, b) => a.basePrice - b.basePrice);
        } else if (params.sort === 'price_desc') {
          filtered.sort((a, b) => b.basePrice - a.basePrice);
        } else if (params.sort === 'name') {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
      }

      const total = filtered.length;
      const page = params.page && params.page > 0 ? params.page : 1;
      const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 12;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      const startIndex = (page - 1) * pageSize;
      const paginated = filtered.slice(startIndex, startIndex + pageSize);

      const items = paginated.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        basePrice: p.basePrice,
        images: p.images,
        category: p.category,
        active: p.active,
      }));

      resolve({
        items,
        total,
        page,
        pageSize,
        totalPages,
      });
    }, 15);
  });
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Deterministic error test trigger
      if (slug === 'error-fail-to-load') {
        reject(
          new ApiException({
            code: 'PRODUCT_LOAD_FAILED',
            message: 'Failed to load product details from server.',
          })
        );
        return;
      }

      const product = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
      if (!product) {
        reject(
          new ApiException({
            code: 'PRODUCT_NOT_FOUND',
            message: 'The requested product could not be found.',
          })
        );
        return;
      }

      resolve({ ...product });
    }, 15);
  });
}

export async function getPriceQuote(
  productId: string,
  request: PriceQuoteRequest
): Promise<PriceQuote> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = MOCK_PRODUCTS.find((p) => p.id === productId);
      if (!product) {
        reject(
          new ApiException({
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product for price quote could not be found.',
          })
        );
        return;
      }

      const selectedIds = new Set(request.selectedOptionIds || []);
      const lines: PriceQuoteLine[] = [{ label: 'Base Price', amount: product.basePrice }];
      const problems: PriceQuoteProblem[] = [];
      let total = product.basePrice;

      // Check each option group
      product.optionGroups.forEach((group) => {
        const chosenInGroup: Option[] = group.options.filter((opt) => selectedIds.has(opt.id));

        if (group.required && chosenInGroup.length === 0) {
          problems.push({
            groupId: group.id,
            message: `Please select a ${group.label.toLowerCase()}.`,
          });
        }

        chosenInGroup.forEach((opt) => {
          if (!opt.available) {
            problems.push({
              groupId: group.id,
              optionId: opt.id,
              message: `${opt.label} is currently unavailable.`,
            });
          }

          if (opt.priceDelta !== 0) {
            lines.push({
              label: `${group.label}: ${opt.label}`,
              amount: opt.priceDelta,
            });
          }
          total += opt.priceDelta;
        });
      });

      const valid = problems.length === 0;

      resolve({
        valid,
        lines,
        total: Math.max(0, total),
        problems: problems.length > 0 ? problems : undefined,
      });
    }, 15);
  });
}
