import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { AppDatabase } from '../db/index.js';
import { carts, cartItems } from '../db/schema.js';

export interface CartItemOption {
  groupId: string;
  groupName: string;
  optionId: string;
  label: string;
  priceDelta: number;
  swatchImageUrl?: string;
  colourValue?: string;
}

export interface InsertCartItemData {
  productId: string;
  selectedOptions: CartItemOption[];
  quantity: number;
  unitPriceAtAdd: number;
}

function areOptionsIdentical(a: CartItemOption[], b: CartItemOption[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x.groupId.localeCompare(y.groupId) || x.optionId.localeCompare(y.optionId));
  const sortedB = [...b].sort((x, y) => x.groupId.localeCompare(y.groupId) || x.optionId.localeCompare(y.optionId));
  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i].groupId !== sortedB[i].groupId || sortedA[i].optionId !== sortedB[i].optionId) {
      return false;
    }
  }
  return true;
}

export class CartRepository {
  constructor(private db: AppDatabase) {}

  async getOrCreateUserCart(userId: string) {
    const existing = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (existing[0]) return existing[0];

    const id = `cart_${randomUUID()}`;
    const [created] = await this.db
      .insert(carts)
      .values({
        id,
        userId,
      })
      .returning();

    return created;
  }

  async getCartWithItems(cartId: string) {
    const cart = await this.db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);

    if (!cart[0]) return null;

    const items = await this.db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId))
      .orderBy(cartItems.createdAt);

    return {
      cart: cart[0],
      items,
    };
  }

  async findItemById(cartId: string, itemId: string) {
    const results = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
      .limit(1);

    return results[0] || null;
  }

  async addItem(cartId: string, data: InsertCartItemData) {
    // Check if duplicate item exists in cart with same product and exact options
    const currentItems = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, data.productId)));

    const matching = currentItems.find((item) =>
      areOptionsIdentical(item.selectedOptions as CartItemOption[], data.selectedOptions)
    );

    if (matching) {
      const newQty = Math.min(50, matching.quantity + data.quantity);
      const [updated] = await this.db
        .update(cartItems)
        .set({
          quantity: newQty,
          unitPriceAtAdd: data.unitPriceAtAdd,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, matching.id))
        .returning();

      return updated;
    }

    const id = `item_${randomUUID()}`;
    const [inserted] = await this.db
      .insert(cartItems)
      .values({
        id,
        cartId,
        productId: data.productId,
        selectedOptions: data.selectedOptions,
        quantity: data.quantity,
        unitPriceAtAdd: data.unitPriceAtAdd,
      })
      .returning();

    return inserted;
  }

  async updateItem(
    cartId: string,
    itemId: string,
    data: {
      quantity?: number;
      selectedOptions?: CartItemOption[];
      unitPriceAtAdd?: number;
    }
  ) {
    const existing = await this.findItemById(cartId, itemId);
    if (!existing) return null;

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (data.quantity !== undefined) updatePayload.quantity = data.quantity;
    if (data.selectedOptions !== undefined) updatePayload.selectedOptions = data.selectedOptions;
    if (data.unitPriceAtAdd !== undefined) updatePayload.unitPriceAtAdd = data.unitPriceAtAdd;

    const [updated] = await this.db
      .update(cartItems)
      .set(updatePayload)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
      .returning();

    return updated;
  }

  async deleteItem(cartId: string, itemId: string): Promise<boolean> {
    const existing = await this.findItemById(cartId, itemId);
    if (!existing) return false;

    await this.db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));

    return true;
  }

  async clearCart(cartId: string): Promise<void> {
    await this.db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }

  async mergeGuestCart(guestToken: string, userId: string) {
    const guestCart = await this.db
      .select()
      .from(carts)
      .where(eq(carts.guestToken, guestToken))
      .limit(1);

    if (!guestCart[0]) return;

    const userCart = await this.getOrCreateUserCart(userId);
    const guestItems = await this.db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, guestCart[0].id));

    for (const item of guestItems) {
      await this.addItem(userCart.id, {
        productId: item.productId,
        selectedOptions: item.selectedOptions as CartItemOption[],
        quantity: item.quantity,
        unitPriceAtAdd: item.unitPriceAtAdd,
      });
    }

    // Clean up guest cart
    await this.db.delete(cartItems).where(eq(cartItems.cartId, guestCart[0].id));
    await this.db.delete(carts).where(eq(carts.id, guestCart[0].id));
  }
}
