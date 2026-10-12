import { CheckoutRequest, CheckoutResponse, Order, OrderItem, PaymentStatus, OrderStatus } from '../../types';
import { ApiException } from '../client';
import { getAddresses } from './addresses';
import { getCart, clearCartInternal } from './cart';
import { addOrderInternal } from './orders';
import { getCurrentUser } from './auth';

export async function createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
  const addresses = await getAddresses();
  const address = addresses.find((a) => a.id === request.addressId);

  if (!address && !request.addressId.startsWith('addr-')) {
    throw new ApiException({
      code: 'INVALID_ADDRESS',
      message: 'Please select a valid delivery address.',
    });
  }

  const selectedAddress = address || {
    id: request.addressId,
    recipientName: 'Customer',
    phone: '9876543210',
    line1: '123 Market St',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560001',
    isDefault: true,
  };

  const cart = await getCart();
  if (cart.items.length === 0) {
    throw new ApiException({
      code: 'CART_EMPTY',
      message: 'Your cart is empty. Add items before proceeding to checkout.',
    });
  }

  // Convert cart items to order items
  const orderItems: OrderItem[] = cart.items.map((item, index) => ({
    id: `ord-item-${index + 1}`,
    productName: item.productName,
    selectedOptionsText: item.selectedOptions
      .map((opt) => `${opt.groupLabel}: ${opt.optionLabel}`)
      .join(', '),
    selectedOptions: item.selectedOptions,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  }));

  const shipping = cart.subtotal >= 1000 ? 0 : 50;
  const total = cart.subtotal + shipping;

  // Determine payment status test triggers
  let paymentStatus: PaymentStatus = 'paid';
  let orderStatus: OrderStatus = 'placed';

  if (request.addressId === 'addr-fail-payment') {
    paymentStatus = 'failed';
    orderStatus = 'cancelled';
  } else if (request.addressId === 'addr-pending-payment') {
    paymentStatus = 'pending';
    orderStatus = 'placed';
  } else if (request.addressId === 'addr-cancel-payment') {
    paymentStatus = 'cancelled';
    orderStatus = 'cancelled';
  }

  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
  const orderId = `ord-${Date.now()}`;

  const currentUser = await getCurrentUser();
  const newOrder: Order = {
    id: orderId,
    orderNumber,
    createdAt: new Date().toISOString(),
    items: orderItems,
    address: selectedAddress,
    totals: {
      subtotal: cart.subtotal,
      shipping,
      total,
    },
    status: orderStatus,
    paymentStatus,
    userId: currentUser?.id,
  };

  addOrderInternal(newOrder);
  clearCartInternal();

  return {
    order: newOrder,
    paymentInfo: {
      gateway: 'mock_gateway',
      gatewayOrderId: `mock_gw_${orderId}`,
      amount: total,
      currency: 'INR',
      keyId: 'mock_key_public',
    },
  };
}
