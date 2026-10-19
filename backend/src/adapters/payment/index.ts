import crypto from 'crypto';

export interface PaymentSessionInfo {
  gateway: string;
  gatewayOrderId: string;
  amount: number; // paise
  currency: string;
  keyId?: string;
}

export interface NormalizedPaymentEvent {
  gateway: string;
  eventId: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  status: 'paid' | 'failed' | 'cancelled';
  amount: number; // paise
  currency: string;
  rawPayload: any;
}

export interface PaymentAdapter {
  createPaymentSession(order: {
    id: string;
    orderNumber: string;
    total: number;
    currency: string;
  }): Promise<PaymentSessionInfo>;

  verifyWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>
  ): Promise<NormalizedPaymentEvent>;

  fetchPaymentStatus(gatewayOrderId: string): Promise<{
    status: 'paid' | 'pending' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
  }>;
}

/**
 * FakePaymentAdapter: Used for automated testing and local development
 */
export class FakePaymentAdapter implements PaymentAdapter {
  public sessions: Map<string, PaymentSessionInfo> = new Map();
  public events: NormalizedPaymentEvent[] = [];

  async createPaymentSession(order: {
    id: string;
    orderNumber: string;
    total: number;
    currency: string;
  }): Promise<PaymentSessionInfo> {
    const gatewayOrderId = `fake_order_${crypto.randomUUID()}`;
    const sessionInfo: PaymentSessionInfo = {
      gateway: 'fake',
      gatewayOrderId,
      amount: order.total,
      currency: order.currency || 'INR',
      keyId: 'fake_public_key',
    };

    this.sessions.set(gatewayOrderId, sessionInfo);
    return sessionInfo;
  }

  async verifyWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>
  ): Promise<NormalizedPaymentEvent> {
    // Check for simulated bad signature
    const signature = headers['x-fake-signature'] || headers['x-razorpay-signature'];
    if (signature === 'bad_signature' || signature === 'invalid') {
      throw new Error('Invalid webhook signature');
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf8'));

    const event: NormalizedPaymentEvent = {
      gateway: 'fake',
      eventId: payload.event_id || payload.id || `evt_${crypto.randomUUID()}`,
      gatewayOrderId: payload.gatewayOrderId || payload.order_id || payload.payload?.payment?.entity?.order_id || 'unknown_order',
      gatewayPaymentId: payload.gatewayPaymentId || payload.payment_id || payload.payload?.payment?.entity?.id,
      status: payload.status || 'paid',
      amount: payload.amount ?? payload.payload?.payment?.entity?.amount ?? 0,
      currency: payload.currency || payload.payload?.payment?.entity?.currency || 'INR',
      rawPayload: payload,
    };

    this.events.push(event);
    return event;
  }

  async fetchPaymentStatus(gatewayOrderId: string): Promise<{
    status: 'paid' | 'pending' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
  }> {
    const session = this.sessions.get(gatewayOrderId);
    return {
      status: 'paid',
      amount: session?.amount || 0,
      currency: session?.currency || 'INR',
    };
  }
}

/**
 * RazorpayPaymentAdapter: Production-ready adapter with HMAC signature verification
 */
export class RazorpayPaymentAdapter implements PaymentAdapter {
  constructor(
    private keyId: string,
    private keySecret: string,
    private webhookSecret: string
  ) {}

  async createPaymentSession(order: {
    id: string;
    orderNumber: string;
    total: number;
    currency: string;
  }): Promise<PaymentSessionInfo> {
    // In production, call Razorpay Orders API (https://api.razorpay.com/v1/orders)
    // using basic auth (keyId:keySecret)
    const basicAuth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    
    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: order.total, // paise
          currency: order.currency,
          receipt: order.orderNumber,
          notes: {
            boutiqueOrderId: order.id,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Razorpay order creation failed: ${response.status} ${errorData}`);
      }

      const data = (await response.json()) as { id: string; amount: number; currency: string };
      return {
        gateway: 'razorpay',
        gatewayOrderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId: this.keyId,
      };
    } catch (err: any) {
      // If network fails or test credentials, fallback gracefully with diagnostic message
      throw new Error(`Failed to initialize payment with Razorpay: ${err.message}`);
    }
  }

  async verifyWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>
  ): Promise<NormalizedPaymentEvent> {
    const signature = headers['x-razorpay-signature'];
    if (!signature || typeof signature !== 'string') {
      throw new Error('Missing x-razorpay-signature header');
    }

    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(bodyString)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid Razorpay webhook signature');
    }

    const payload = JSON.parse(bodyString);
    const eventType = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    let status: 'paid' | 'failed' | 'cancelled' = 'failed';
    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      status = 'paid';
    } else if (eventType === 'payment.failed') {
      status = 'failed';
    } else if (eventType === 'order.expired' || eventType === 'payment.cancelled') {
      status = 'cancelled';
    }

    return {
      gateway: 'razorpay',
      eventId: payload.id || `rzp_evt_${crypto.randomUUID()}`,
      gatewayOrderId: paymentEntity?.order_id || payload.payload?.order?.entity?.id || 'unknown',
      gatewayPaymentId: paymentEntity?.id,
      status,
      amount: paymentEntity?.amount || payload.payload?.order?.entity?.amount || 0,
      currency: paymentEntity?.currency || 'INR',
      rawPayload: payload,
    };
  }

  async fetchPaymentStatus(gatewayOrderId: string): Promise<{
    status: 'paid' | 'pending' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
  }> {
    const basicAuth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/orders/${gatewayOrderId}`, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Razorpay order status: ${response.status}`);
    }

    const data = (await response.json()) as { status: string; amount: number; currency: string };
    let status: 'paid' | 'pending' | 'failed' | 'cancelled' = 'pending';
    if (data.status === 'paid') status = 'paid';
    else if (data.status === 'attempted') status = 'pending';

    return {
      status,
      amount: data.amount,
      currency: data.currency,
    };
  }
}

export function getPaymentAdapter(): PaymentAdapter {
  const gateway = process.env.PAYMENT_GATEWAY || 'fake';

  if (gateway === 'razorpay') {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    return new RazorpayPaymentAdapter(keyId, keySecret, webhookSecret);
  }

  return new FakePaymentAdapter();
}
