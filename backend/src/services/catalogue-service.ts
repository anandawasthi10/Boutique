import { CategoryRepository } from '../repositories/category-repository.js';
import { ProductRepository, ProductFilterParams } from '../repositories/product-repository.js';
import { QuoteInput } from '../schemas/catalogue-schemas.js';
import { NotFoundError } from '../errors/app-error.js';

export interface QuoteProblem {
  groupId: string;
  optionId?: string;
  message: string;
}

export interface QuoteLine {
  label: string;
  amount: number;
}

export class CatalogueService {
  constructor(
    private categoryRepo: CategoryRepository,
    private productRepo: ProductRepository
  ) {}

  async getCategories() {
    return this.categoryRepo.listPublished();
  }

  async getProducts(params: ProductFilterParams) {
    return this.productRepo.findPublished(params);
  }

  async getProductDetail(idOrSlug: string) {
    const product = await this.productRepo.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw new NotFoundError(`Product '${idOrSlug}' was not found`);
    }
    return product;
  }

  async calculateQuote(productIdOrSlug: string, input: QuoteInput) {
    const product = await this.productRepo.findByIdOrSlug(productIdOrSlug);
    if (!product) {
      throw new NotFoundError(`Product '${productIdOrSlug}' was not found`);
    }

    const problems: QuoteProblem[] = [];
    const normalizedSelections: Array<{ groupId: string; optionId: string }> = [];

    // Normalize input selections from either { groupId, optionId }[] or selectedOptionIds[]
    if (input.selections && input.selections.length > 0) {
      normalizedSelections.push(...input.selections);
    } else if (input.selectedOptionIds && input.selectedOptionIds.length > 0) {
      for (const optId of input.selectedOptionIds) {
        // Find which group this option belongs to in the product
        let foundGroup = false;
        for (const g of product.optionGroups) {
          if (g.options.some((o) => o.id === optId)) {
            normalizedSelections.push({ groupId: g.id, optionId: optId });
            foundGroup = true;
            break;
          }
        }
        if (!foundGroup) {
          problems.push({
            groupId: 'unknown',
            optionId: optId,
            message: `Option '${optId}' does not belong to this product`,
          });
        }
      }
    }

    const selectedOptionIdSet = new Set(normalizedSelections.map((s) => s.optionId));
    const lines: QuoteLine[] = [
      { label: `${product.name} (Base price)`, amount: product.basePrice },
    ];
    let unitPrice = product.basePrice;

    // 1. Check required groups
    for (const group of product.optionGroups) {
      const selectionForGroup = normalizedSelections.find((s) => s.groupId === group.id);
      if (group.required && !selectionForGroup) {
        problems.push({
          groupId: group.id,
          message: `Selection is required for ${group.name}`,
        });
      }
    }

    // 2. Validate selections against options
    for (const selection of normalizedSelections) {
      const group = product.optionGroups.find((g) => g.id === selection.groupId);
      if (!group) {
        problems.push({
          groupId: selection.groupId,
          optionId: selection.optionId,
          message: `Option group '${selection.groupId}' does not belong to this product`,
        });
        continue;
      }

      const option = group.options.find((o) => o.id === selection.optionId);
      if (!option) {
        problems.push({
          groupId: selection.groupId,
          optionId: selection.optionId,
          message: `Option '${selection.optionId}' does not exist in ${group.name}`,
        });
        continue;
      }

      if (!option.available) {
        problems.push({
          groupId: selection.groupId,
          optionId: selection.optionId,
          message: option.unavailableReason || `${option.label} is currently out of stock`,
        });
      }

      // Add price delta
      unitPrice += option.priceDelta;
      if (option.priceDelta !== 0) {
        lines.push({
          label: `${group.name}: ${option.label}`,
          amount: option.priceDelta,
        });
      }
    }

    // 3. Validate compatibility rules
    if (product.compatibilityRules) {
      for (const rule of product.compatibilityRules) {
        if (
          selectedOptionIdSet.has(rule.primaryOptionId) &&
          selectedOptionIdSet.has(rule.incompatibleOptionId)
        ) {
          problems.push({
            groupId: 'compatibility',
            optionId: rule.incompatibleOptionId,
            message: rule.message,
          });
        }
      }
    }

    const quantity = Math.max(1, input.quantity);
    const total = unitPrice * quantity;

    return {
      valid: problems.length === 0,
      unitPrice,
      total,
      currency: 'INR',
      lines,
      problems,
    };
  }
}
