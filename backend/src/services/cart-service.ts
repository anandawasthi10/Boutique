import { CartRepository, CartItemOption } from '../repositories/cart-repository.js';
import { ProductRepository } from '../repositories/product-repository.js';
import { CatalogueService } from './catalogue-service.js';
import { AddCartItemInput, UpdateCartItemInput } from '../schemas/cart-schemas.js';
import { NotFoundError, InvalidConfigurationError } from '../errors/app-error.js';

export interface FormattedCartItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  image?: string;
  selectedOptions: CartItemOption[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  status: 'available' | 'price_changed' | 'unavailable';
}

export interface FormattedCart {
  items: FormattedCartItem[];
  subtotal: number;
  currency: string;
}

export class CartService {
  constructor(
    private cartRepo: CartRepository,
    private productRepo: ProductRepository,
    private catalogueService: CatalogueService
  ) {}

  async getCart(userId: string): Promise<FormattedCart> {
    const cart = await this.cartRepo.getOrCreateUserCart(userId);
    const cartData = await this.cartRepo.getCartWithItems(cart.id);
    const items = cartData?.items || [];

    const formattedItems: FormattedCartItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await this.productRepo.findByIdOrSlug(item.productId);

      if (!product || !product.published) {
        formattedItems.push({
          id: item.id,
          productId: item.productId,
          productSlug: product?.slug || 'unknown',
          productName: product?.name || 'Unavailable Product',
          image: product?.images?.[0]?.url,
          selectedOptions: item.selectedOptions as CartItemOption[],
          quantity: item.quantity,
          unitPrice: item.unitPriceAtAdd,
          lineTotal: item.unitPriceAtAdd * item.quantity,
          status: 'unavailable',
        });
        continue;
      }

      const selections = (item.selectedOptions as CartItemOption[]).map((o) => ({
        groupId: o.groupId,
        optionId: o.optionId,
      }));

      const quote = await this.catalogueService.calculateQuote(item.productId, {
        selections,
        quantity: item.quantity,
      });

      let status: 'available' | 'price_changed' | 'unavailable' = 'available';
      let currentUnitPrice = quote.unitPrice;

      if (!quote.valid) {
        status = 'unavailable';
        currentUnitPrice = item.unitPriceAtAdd;
      } else if (quote.unitPrice !== item.unitPriceAtAdd) {
        status = 'price_changed';
        currentUnitPrice = quote.unitPrice;
      }

      const lineTotal = currentUnitPrice * item.quantity;
      if (status !== 'unavailable') {
        subtotal += lineTotal;
      }

      formattedItems.push({
        id: item.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        image: product.images?.[0]?.url,
        selectedOptions: item.selectedOptions as CartItemOption[],
        quantity: item.quantity,
        unitPrice: currentUnitPrice,
        lineTotal,
        status,
      });
    }

    return {
      items: formattedItems,
      subtotal,
      currency: 'INR',
    };
  }

  async addItem(userId: string, input: AddCartItemInput) {
    const product = await this.productRepo.findByIdOrSlug(input.productId);
    if (!product || !product.published) {
      throw new NotFoundError('Product not found');
    }

    // 0. Normalize selections from selections or selectedOptionIds
    const normalizedSelections: Array<{ groupId: string; optionId: string }> = [];
    if (input.selections && input.selections.length > 0) {
      normalizedSelections.push(...input.selections);
    } else if (input.selectedOptionIds && input.selectedOptionIds.length > 0) {
      for (const optId of input.selectedOptionIds) {
        for (const g of product.optionGroups) {
          if (g.options.some((o) => o.id === optId)) {
            normalizedSelections.push({ groupId: g.id, optionId: optId });
            break;
          }
        }
      }
    }

    // 1. Validate configuration and calculate price
    const quote = await this.catalogueService.calculateQuote(product.id, {
      selections: normalizedSelections,
      quantity: input.quantity,
    });

    if (!quote.valid) {
      const details = quote.problems.map((p) => ({
        field: p.groupId,
        message: p.message,
        groupId: p.groupId,
        optionId: p.optionId,
      }));
      throw new InvalidConfigurationError(
        'The selected options are invalid or incompatible',
        details
      );
    }

    // 2. Build full snapshot of selected options
    const enrichedOptions: CartItemOption[] = [];
    for (const sel of normalizedSelections) {
      const group = product.optionGroups.find((g) => g.id === sel.groupId);
      const option = group?.options.find((o) => o.id === sel.optionId);

      if (group && option) {
        enrichedOptions.push({
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          label: option.label,
          priceDelta: option.priceDelta,
          swatchImageUrl: option.swatchImageUrl,
          colourValue: option.colourValue,
        });
      }
    }

    // 3. Add to user cart
    const cart = await this.cartRepo.getOrCreateUserCart(userId);
    const addedItem = await this.cartRepo.addItem(cart.id, {
      productId: product.id,
      selectedOptions: enrichedOptions,
      quantity: input.quantity,
      unitPriceAtAdd: quote.unitPrice,
    });

    return {
      id: addedItem.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: product.images?.[0]?.url,
      selectedOptions: enrichedOptions,
      quantity: addedItem.quantity,
      unitPrice: quote.unitPrice,
      lineTotal: quote.unitPrice * addedItem.quantity,
      status: 'available' as const,
    };
  }

  async updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
    const cart = await this.cartRepo.getOrCreateUserCart(userId);
    const item = await this.cartRepo.findItemById(cart.id, itemId);

    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    const product = await this.productRepo.findByIdOrSlug(item.productId);
    if (!product || !product.published) {
      throw new NotFoundError('Product not found');
    }

    const quantity = input.quantity ?? item.quantity;
    let selectedOptions = item.selectedOptions as CartItemOption[];
    let unitPrice = item.unitPriceAtAdd;

    let normalizedUpdateSelections: Array<{ groupId: string; optionId: string }> | undefined;
    if (input.selections && input.selections.length > 0) {
      normalizedUpdateSelections = input.selections;
    } else if (input.selectedOptionIds && input.selectedOptionIds.length > 0) {
      normalizedUpdateSelections = [];
      for (const optId of input.selectedOptionIds) {
        for (const g of product.optionGroups) {
          if (g.options.some((o) => o.id === optId)) {
            normalizedUpdateSelections.push({ groupId: g.id, optionId: optId });
            break;
          }
        }
      }
    }

    if (normalizedUpdateSelections) {
      const quote = await this.catalogueService.calculateQuote(product.id, {
        selections: normalizedUpdateSelections,
        quantity,
      });

      if (!quote.valid) {
        const details = quote.problems.map((p) => ({
          field: p.groupId,
          message: p.message,
          groupId: p.groupId,
          optionId: p.optionId,
        }));
        throw new InvalidConfigurationError(
          'The selected options are invalid or incompatible',
          details
        );
      }

      unitPrice = quote.unitPrice;
      selectedOptions = [];

      for (const sel of normalizedUpdateSelections) {
        const group = product.optionGroups.find((g) => g.id === sel.groupId);
        const option = group?.options.find((o) => o.id === sel.optionId);

        if (group && option) {
          selectedOptions.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            label: option.label,
            priceDelta: option.priceDelta,
            swatchImageUrl: option.swatchImageUrl,
            colourValue: option.colourValue,
          });
        }
      }
    }

    const updated = await this.cartRepo.updateItem(cart.id, itemId, {
      quantity,
      selectedOptions,
      unitPriceAtAdd: unitPrice,
    });

    return {
      id: updated!.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: product.images?.[0]?.url,
      selectedOptions,
      quantity: updated!.quantity,
      unitPrice,
      lineTotal: unitPrice * updated!.quantity,
      status: 'available' as const,
    };
  }

  async deleteItem(userId: string, itemId: string) {
    const cart = await this.cartRepo.getOrCreateUserCart(userId);
    const deleted = await this.cartRepo.deleteItem(cart.id, itemId);

    if (!deleted) {
      throw new NotFoundError('Cart item not found');
    }

    return { success: true };
  }
}
