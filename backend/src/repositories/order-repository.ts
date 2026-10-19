import { eq, and, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { AppDatabase } from '../db/index.js';
import {
  orders,
  orderItems,
  payments,
  paymentEvents,
  orderStatusHistory,
} from '../db/schema.js';

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  selectedOptionsText: string;
  selectedOptions: any;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CreateOrderParams {
  userId: string;
  addressSnapshot: any;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency?: string;
  items: OrderItemSnapshot[];
  paymentExpiresAt: Date;
}

export class OrderRepository {
  constructor(private db: AppDatabase) {}

  generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${dateStr}-${rand}`;
  }

  async createOrder(params: CreateOrderParams) {
    const orderId = `ord_${randomUUID()}`;
    const orderNumber = this.generateOrderNumber();
    const currency = params.currency || 'INR';

    const [createdOrder] = await this.db
      .insert(orders)
      .values({
        id: orderId,
        orderNumber,
        userId: params.userId,
        addressSnapshot: params.addressSnapshot,
        subtotal: params.subtotal,
        shipping: params.shipping,
        tax: params.tax,
        total: params.total,
        currency,
        status: 'placed',
        paymentStatus: 'pending',
        paymentExpiresAt: params.paymentExpiresAt,
      })
      .returning();

    // Insert order items
    const insertedItems = [];
    for (const item of params.items) {
      const itemId = `ord_item_${randomUUID()}`;
      const [insertedItem] = await this.db
        .insert(orderItems)
        .values({
          id: itemId,
          orderId,
          productId: item.productId,
          productName: item.productName,
          selectedOptionsText: item.selectedOptionsText,
          selectedOptions: item.selectedOptions,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })
        .returning();
      insertedItems.push(insertedItem);
    }

    // Insert initial status history
    await this.db.insert(orderStatusHistory).values({
      id: `osh_${randomUUID()}`,
      orderId,
      fromStatus: 'none',
      toStatus: 'placed',
      changedBy: params.userId,
      reason: 'Order placed by customer',
    });

    return {
      ...createdOrder,
      items: insertedItems,
    };
  }

  async recordPayment(data: {
    orderId: string;
    gateway: string;
    gatewayOrderId: string;
    amount: number;
    currency: string;
  }) {
    const id = `pay_${randomUUID()}`;
    const [payment] = await this.db
      .insert(payments)
      .values({
        id,
        orderId: data.orderId,
        gateway: data.gateway,
        gatewayOrderId: data.gatewayOrderId,
        amount: data.amount,
        currency: data.currency,
        status: 'pending',
      })
      .returning();
    return payment;
  }

  async findById(id: string, userId?: string) {
    const conditions = [eq(orders.id, id)];
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }

    const orderRows = await this.db
      .select()
      .from(orders)
      .where(and(...conditions))
      .limit(1);

    if (!orderRows[0]) return null;
    const order = orderRows[0];

    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    const paymentRows = await this.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(desc(payments.createdAt))
      .limit(1);

    return {
      ...order,
      items,
      payment: paymentRows[0] || null,
    };
  }

  async findByGatewayOrderId(gatewayOrderId: string) {
    const paymentRows = await this.db
      .select()
      .from(payments)
      .where(eq(payments.gatewayOrderId, gatewayOrderId))
      .limit(1);

    if (!paymentRows[0]) return null;

    return this.findById(paymentRows[0].orderId);
  }

  async findManyByUser(userId: string, options: { page: number; pageSize: number }) {
    const { page, pageSize } = options;
    const offset = (page - 1) * pageSize;

    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.userId, userId));

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / pageSize) || 1;

    const userOrders = await this.db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset);

    const fullOrders = [];
    for (const ord of userOrders) {
      const items = await this.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, ord.id));
      fullOrders.push({
        ...ord,
        items,
      });
    }

    return {
      items: fullOrders,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async updatePaymentAndOrderStatus(data: {
    orderId: string;
    paymentStatus: string;
    orderStatus?: string;
    gatewayPaymentId?: string;
    changedBy: string;
    reason?: string;
  }) {
    const current = await this.findById(data.orderId);
    if (!current) return null;

    const updatePayload: Record<string, any> = {
      paymentStatus: data.paymentStatus,
      updatedAt: new Date(),
    };

    if (data.orderStatus) {
      updatePayload.status = data.orderStatus;
    }

    const [updated] = await this.db
      .update(orders)
      .set(updatePayload)
      .where(eq(orders.id, data.orderId))
      .returning();

    // Update payment record
    if (data.gatewayPaymentId) {
      await this.db
        .update(payments)
        .set({
          status: data.paymentStatus,
          gatewayPaymentId: data.gatewayPaymentId,
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, data.orderId));
    } else {
      await this.db
        .update(payments)
        .set({
          status: data.paymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, data.orderId));
    }

    // Record status history if order status transitioned
    if (data.orderStatus && data.orderStatus !== current.status) {
      await this.db.insert(orderStatusHistory).values({
        id: `osh_${randomUUID()}`,
        orderId: data.orderId,
        fromStatus: current.status,
        toStatus: data.orderStatus,
        changedBy: data.changedBy,
        reason: data.reason || `Status updated to ${data.orderStatus}`,
      });
    }

    return updated;
  }

  async recordPaymentEvent(
    gateway: string,
    eventId: string,
    eventType: string,
    payload: any
  ): Promise<boolean> {
    const id = `pevt_${randomUUID()}`;
    try {
      await this.db.insert(paymentEvents).values({
        id,
        gateway,
        eventId,
        eventType,
        payload,
      });
      return true;
    } catch {
      // Event already recorded (idempotent duplicate webhook)
      return false;
    }
  }
}
