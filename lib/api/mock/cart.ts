import {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartItemSelection,
} from '../../types';
import { ApiException } from '../client';
import { MOCK_PRODUCTS } from './data';

// In-memory cart store
let inMemoryCart: Cart = {
  items: [],
  subtotal: 0,
  total: 0,
  notices: [],
};

function recalculateCart(): Cart {
  const subtotal = inMemoryCart.items.reduce((sum, item) => sum + item.lineTotal, 0);
  inMemoryCart.subtotal = subtotal;
  inMemoryCart.total = subtotal;
  return JSON.parse(JSON.stringify(inMemoryCart));
}

export async function getCart(): Promise<Cart> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(recalculateCart());
    }, 10);
  });
}

export async function addToCart(request: AddToCartRequest): Promise<Cart> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!request.productId) {
        reject(
          new ApiException({
            code: 'VALIDATION_ERROR',
            message: 'Product ID is required.',
          })
        );
        return;
      }

      if (request.quantity <= 0) {
        reject(
          new ApiException({
            code: 'VALIDATION_ERROR',
            message: 'Quantity must be at least 1.',
            fieldErrors: { quantity: 'Quantity must be greater than 0' },
          })
        );
        return;
      }

      const product = MOCK_PRODUCTS.find((p) => p.id === request.productId);
      if (!product) {
        reject(
          new ApiException({
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product to add was not found.',
          })
        );
        return;
      }

      // Collect option details
      const selectedIds = new Set(request.selectedOptionIds);
      const selections: CartItemSelection[] = [];
      let unitPrice = product.basePrice;

      product.optionGroups.forEach((group) => {
        group.options.forEach((opt) => {
          if (selectedIds.has(opt.id)) {
            unitPrice += opt.priceDelta;
            selections.push({
              groupId: group.id,
              groupLabel: group.label,
              optionId: opt.id,
              optionLabel: opt.label,
              swatchImageUrl: opt.swatchImageUrl,
              colourValue: opt.colourValue,
            });
          }
        });
      });

      const lineTotal = unitPrice * request.quantity;
      const newItem: CartItem = {
        id: `cart-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: product.id,
        productName: product.name,
        image: product.images[0]?.url || '/images/placeholders/scrunchie-1.svg',
        selectedOptions: selections,
        quantity: request.quantity,
        unitPrice,
        lineTotal,
        status: 'available',
      };

      inMemoryCart.items.push(newItem);
      resolve(recalculateCart());
    }, 15);
  });
}

export async function updateCartItem(
  itemId: string,
  request: UpdateCartItemRequest
): Promise<Cart> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const itemIndex = inMemoryCart.items.findIndex((i) => i.id === itemId);
      if (itemIndex === -1) {
        reject(
          new ApiException({
            code: 'CART_ITEM_NOT_FOUND',
            message: 'Item not found in cart.',
          })
        );
        return;
      }

      const item = inMemoryCart.items[itemIndex];
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);

      if (request.quantity !== undefined) {
        if (request.quantity <= 0) {
          // Remove item if quantity is 0
          inMemoryCart.items.splice(itemIndex, 1);
          resolve(recalculateCart());
          return;
        }
        item.quantity = request.quantity;
      }

      if (request.selectedOptionIds && product) {
        const selectedIds = new Set(request.selectedOptionIds);
        const newSelections: CartItemSelection[] = [];
        let unitPrice = product.basePrice;

        product.optionGroups.forEach((group) => {
          group.options.forEach((opt) => {
            if (selectedIds.has(opt.id)) {
              unitPrice += opt.priceDelta;
              newSelections.push({
                groupId: group.id,
                groupLabel: group.label,
                optionId: opt.id,
                optionLabel: opt.label,
                swatchImageUrl: opt.swatchImageUrl,
                colourValue: opt.colourValue,
              });
            }
          });
        });

        item.selectedOptions = newSelections;
        item.unitPrice = unitPrice;
      }

      item.lineTotal = item.unitPrice * item.quantity;
      resolve(recalculateCart());
    }, 15);
  });
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = inMemoryCart.items.length;
      inMemoryCart.items = inMemoryCart.items.filter((i) => i.id !== itemId);
      if (inMemoryCart.items.length === initialLength) {
        reject(
          new ApiException({
            code: 'CART_ITEM_NOT_FOUND',
            message: 'Cart item could not be found to remove.',
          })
        );
        return;
      }
      resolve(recalculateCart());
    }, 15);
  });
}

export function clearCartInternal(): void {
  inMemoryCart = {
    items: [],
    subtotal: 0,
    total: 0,
    notices: [],
  };
}
