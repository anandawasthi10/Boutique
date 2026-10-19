export interface EmailAdapter {
  sendPasswordReset(to: string, resetLink: string): Promise<boolean>;
  sendOrderConfirmation(to: string, orderNumber: string, totalPaise: number): Promise<boolean>;
  sendOrderDispatched(to: string, orderNumber: string, trackingInfo?: string): Promise<boolean>;
}

export interface SentEmail {
  to: string;
  type: 'reset_password' | 'order_confirmation' | 'order_dispatched';
  data: Record<string, unknown>;
  sentAt: Date;
}

export class FakeEmailAdapter implements EmailAdapter {
  public sentEmails: SentEmail[] = [];

  async sendPasswordReset(to: string, resetLink: string): Promise<boolean> {
    this.sentEmails.push({
      to,
      type: 'reset_password',
      data: { resetLink },
      sentAt: new Date(),
    });
    return true;
  }

  async sendOrderConfirmation(to: string, orderNumber: string, totalPaise: number): Promise<boolean> {
    this.sentEmails.push({
      to,
      type: 'order_confirmation',
      data: { orderNumber, totalPaise },
      sentAt: new Date(),
    });
    return true;
  }

  async sendOrderDispatched(to: string, orderNumber: string, trackingInfo?: string): Promise<boolean> {
    this.sentEmails.push({
      to,
      type: 'order_dispatched',
      data: { orderNumber, trackingInfo },
      sentAt: new Date(),
    });
    return true;
  }

  clear(): void {
    this.sentEmails = [];
  }
}

let activeEmailAdapter: EmailAdapter = new FakeEmailAdapter();

export function getEmailAdapter(): EmailAdapter {
  return activeEmailAdapter;
}

export function setEmailAdapter(adapter: EmailAdapter): void {
  activeEmailAdapter = adapter;
}
