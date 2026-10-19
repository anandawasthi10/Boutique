import { PaymentAdapter } from '../adapters/payment/index.js';
import { OrderRepository } from '../repositories/order-repository.js';
import { UserRepository } from '../repositories/user-repository.js';
import { EmailAdapter } from '../adapters/email/index.js';
import { ValidationError } from '../errors/app-error.js';

export class PaymentService {
  constructor(
    private paymentAdapter: PaymentAdapter,
    private orderRepo: OrderRepository,
    private userRepo: UserRepository,
    private emailAdapter: EmailAdapter
  ) {}

  async handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>
  ) {
    // 1. Verify signature
    let event;
    try {
      event = await this.paymentAdapter.verifyWebhook(rawBody, headers);
    } catch (err: any) {
      throw new ValidationError(err.message || 'Invalid webhook signature');
    }

    // 2. Check webhook idempotency
    const isNew = await this.orderRepo.recordPaymentEvent(
      event.gateway,
      event.eventId,
      event.status,
      event.rawPayload
    );

    if (!isNew) {
      return { status: 'already_processed', eventId: event.eventId };
    }

    // 3. Find order by gateway order ID
    const order = await this.orderRepo.findByGatewayOrderId(event.gatewayOrderId);
    if (!order) {
      // Unknown orders ignored safely without throwing
      return { status: 'order_not_found_ignored', gatewayOrderId: event.gatewayOrderId };
    }

    // 4. Handle status transitions
    if (event.status === 'paid') {
      // Amount and currency verification
      if (event.amount !== order.total || event.currency !== order.currency) {
        // Do NOT mark paid if amounts do not match exactly
        return {
          status: 'amount_mismatch_logged',
          expected: { amount: order.total, currency: order.currency },
          received: { amount: event.amount, currency: event.currency },
        };
      }

      await this.orderRepo.updatePaymentAndOrderStatus({
        orderId: order.id,
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        gatewayPaymentId: event.gatewayPaymentId,
        changedBy: 'payment_webhook',
        reason: 'Payment confirmed via verified gateway webhook',
      });

      // Send non-blocking order confirmation email
      this.sendOrderConfirmationEmail(order).catch(() => {});
    } else if (event.status === 'failed') {
      await this.orderRepo.updatePaymentAndOrderStatus({
        orderId: order.id,
        paymentStatus: 'failed',
        gatewayPaymentId: event.gatewayPaymentId,
        changedBy: 'payment_webhook',
        reason: 'Payment failed via gateway webhook',
      });
    } else if (event.status === 'cancelled') {
      await this.orderRepo.updatePaymentAndOrderStatus({
        orderId: order.id,
        paymentStatus: 'cancelled',
        gatewayPaymentId: event.gatewayPaymentId,
        changedBy: 'payment_webhook',
        reason: 'Payment session expired or cancelled',
      });
    }

    return { status: 'ok', eventId: event.eventId, orderId: order.id };
  }

  private async sendOrderConfirmationEmail(order: any) {
    try {
      const user = await this.userRepo.findById(order.userId);
      if (!user) return;

      await this.emailAdapter.sendOrderConfirmation(
        user.email,
        order.orderNumber,
        order.total
      );
    } catch {
      // Never break webhook execution on email errors
    }
  }
}
