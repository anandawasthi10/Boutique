import { createHash } from 'crypto';
import { CartRepository, CartItemOption } from '../repositories/cart-repository.js';
import { AddressRepository } from '../repositories/address-repository.js';
import { ProductRepository } from '../repositories/product-repository.js';
import { OrderRepository } from '../repositories/order-repository.js';
import { IdempotencyRepository } from '../repositories/idempotency-repository.js';
import { CatalogueService } from './catalogue-service.js';
import { PaymentAdapter } from '../adapters/payment/index.js';
import { ValidationError, NotFoundError, CartChangedError } from '../errors/app-error.js';

export class CheckoutService {
  constructor(
    private cartRepo: CartRepository,
    private addressRepo: AddressRepository,
    private productRepo: ProductRepository,
    private orderRepo: OrderRepository,
    private idempotencyRepo: IdempotencyRepository,
    private catalogueService: CatalogueService,
    private paymentAdapter: PaymentAdapter
  ) {}

  async checkout(
    userId: string,
    addressId: string,
    idempotencyKey?: string
  ): Promise<{ statusCode: number; payload: any }> {
    const endpoint = '/api/v1/checkout';

    // 1. Check idempotency cache if key provided
    if (idempotencyKey && idempotencyKey.trim().length > 0) {
      const cached = await this.idempotencyRepo.find(idempotencyKey, userId, endpoint);
      if (cached) {
        return {
          statusCode: cached.responseStatus,
          payload: cached.responseBody,
        };
      }
    }

    // 2. Load user cart
    const cart = await this.cartRepo.getOrCreateUserCart(userId);
    const cartData = await this.cartRepo.getCartWithItems(cart.id);

    if (!cartData || cartData.items.length === 0) {
      throw new ValidationError('Your cart is empty. Add items before checking out.');
    }

    // 3. Load and verify delivery address ownership
    const address = await this.addressRepo.findById(addressId, userId);
    if (!address) {
      throw new NotFoundError('Selected delivery address was not found.');
    }

    // 4. Re-price every item in the cart
    const changedItems: any[] = [];
    const itemSnapshots = [];

    for (const item of cartData.items) {
      const product = await this.productRepo.findByIdOrSlug(item.productId);

      if (!product || !product.published) {
        changedItems.push({
          itemId: item.id,
          productId: item.productId,
          status: 'unavailable',
          reason: 'Product is no longer available',
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

      if (!quote.valid) {
        changedItems.push({
          itemId: item.id,
          productId: item.productId,
          status: 'unavailable',
          reason: quote.problems[0]?.message || 'Configuration no longer valid',
        });
        continue;
      }

      if (quote.unitPrice !== item.unitPriceAtAdd) {
        changedItems.push({
          itemId: item.id,
          productId: item.productId,
          status: 'price_changed',
          oldPrice: item.unitPriceAtAdd,
          newPrice: quote.unitPrice,
        });
        continue;
      }

      const selectedOptionsText = (item.selectedOptions as CartItemOption[])
        .map((o) => `${o.groupName}: ${o.label}`)
        .join(', ');

      itemSnapshots.push({
        productId: product.id,
        productName: product.name,
        selectedOptionsText,
        selectedOptions: item.selectedOptions,
        unitPrice: item.unitPriceAtAdd,
        quantity: item.quantity,
        lineTotal: item.unitPriceAtAdd * item.quantity,
      });
    }

    if (changedItems.length > 0) {
      throw new CartChangedError(
        'Items in your cart have changed or become unavailable',
        changedItems
      );
    }

    // 5. Calculate totals (D-01: paise, D-03: shipping/tax default 0)
    const subtotal = itemSnapshots.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = 0;
    const tax = 0;
    const total = subtotal + shipping + tax;

    // 6. Create order in pending payment status with 30-min expiry
    const paymentExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const addressSnapshot = {
      fullName: address.fullName,
      recipientName: address.recipientName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      pinCode: address.pinCode,
    };

    const createdOrder = await this.orderRepo.createOrder({
      userId,
      addressSnapshot,
      subtotal,
      shipping,
      tax,
      total,
      currency: 'INR',
      items: itemSnapshots,
      paymentExpiresAt,
    });

    // 7. Create payment session via PaymentAdapter
    const paymentInfo = await this.paymentAdapter.createPaymentSession({
      id: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      total,
      currency: 'INR',
    });

    // Save payment record
    await this.orderRepo.recordPayment({
      orderId: createdOrder.id,
      gateway: paymentInfo.gateway,
      gatewayOrderId: paymentInfo.gatewayOrderId,
      amount: total,
      currency: 'INR',
    });

    // 8. Clear user cart
    await this.cartRepo.clearCart(cart.id);

    // 9. Format response matching API Specification
    const responsePayload = {
      order: {
        id: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
        paymentStatus: createdOrder.paymentStatus,
        items: createdOrder.items,
        address: createdOrder.addressSnapshot,
        totals: {
          subtotal,
          shipping,
          tax,
          total,
        },
        currency: 'INR',
        createdAt: createdOrder.createdAt.toISOString(),
      },
      paymentInfo,
    };

    // 10. Cache in idempotency repository if key was provided
    if (idempotencyKey && idempotencyKey.trim().length > 0) {
      const requestHash = createHash('sha256')
        .update(JSON.stringify({ userId, addressId }))
        .digest('hex');

      await this.idempotencyRepo.save(
        idempotencyKey,
        userId,
        endpoint,
        requestHash,
        201,
        responsePayload
      );
    }

    return {
      statusCode: 201,
      payload: responsePayload,
    };
  }

  async listUserOrders(userId: string, page: number, pageSize: number) {
    return this.orderRepo.findManyByUser(userId, { page, pageSize });
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.orderRepo.findById(orderId, userId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items,
      address: order.addressSnapshot,
      totals: {
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
      },
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
