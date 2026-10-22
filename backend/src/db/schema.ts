import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
  varchar,
  foreignKey,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 1. Users
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull().default('customer'), // 'customer' | 'staff'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

// 2. Sessions (Session tokens are hashed in DB per D-05)
export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    sessionIdHash: text('session_id_hash').notNull().unique(),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_sessions_user_id').on(table.userId),
    index('idx_sessions_expires_at').on(table.expiresAt),
  ]
);

// 3. Password Reset Tokens (single-use, expires in 30m, hash only)
export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    tokenHash: text('token_hash').notNull().unique(),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_reset_tokens_user_id').on(table.userId),
    index('idx_reset_tokens_hash').on(table.tokenHash),
    index('idx_reset_tokens_expires').on(table.expiresAt),
  ]
);

// 4. Categories
export const categories = pgTable(
  'categories',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    image: text('image'),
    sortOrder: integer('sort_order').notNull().default(0),
    published: boolean('published').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_categories_sort_order').on(table.sortOrder),
    index('idx_categories_published').on(table.published),
  ]
);

// 5. Products
export const products = pgTable(
  'products',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    categoryId: varchar('category_id', { length: 64 })
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    basePrice: integer('base_price').notNull(), // paise
    currency: text('currency').notNull().default('INR'),
    images: jsonb('images').$type<Array<{ url: string; alt: string; order: number }>>().notNull().default(sql`'[]'::jsonb`),
    published: boolean('published').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_products_category_id').on(table.categoryId),
    index('idx_products_published').on(table.published),
    index('idx_products_base_price').on(table.basePrice),
    index('idx_products_name').on(table.name),
  ]
);

// 6. Option Groups
export const optionGroups = pgTable(
  'option_groups',
  {
    id: varchar('id', { length: 64 }).notNull(), // 'fabric', 'size', 'charm'
    productId: varchar('product_id', { length: 64 })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type').notNull().default('swatch'), // 'swatch' | 'colour' | 'chips' | 'toggle'
    required: boolean('required').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    defaultOptionId: varchar('default_option_id', { length: 64 }),
    affectsImage: boolean('affects_image').notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.id] }),
    index('idx_option_groups_product').on(table.productId),
  ]
);

// 7. Options
export const options = pgTable(
  'options',
  {
    id: varchar('id', { length: 64 }).notNull(), // 'fab_mocha_cord'
    productId: varchar('product_id', { length: 64 }).notNull(),
    groupId: varchar('group_id', { length: 64 }).notNull(),
    label: text('label').notNull(),
    priceDelta: integer('price_delta').notNull().default(0), // paise
    swatchImageUrl: text('swatch_image_url'),
    colourValue: text('colour_value'),
    previewImageUrl: text('preview_image_url'),
    detail: text('detail'),
    available: boolean('available').notNull().default(true),
    unavailableReason: text('unavailable_reason'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.groupId, table.id] }),
    foreignKey({
      columns: [table.productId, table.groupId],
      foreignColumns: [optionGroups.productId, optionGroups.id],
    }).onDelete('cascade'),
    index('idx_options_group').on(table.productId, table.groupId),
    index('idx_options_available').on(table.available),
  ]
);

// 8. Option Compatibility Rules (Exclusions)
export const optionCompatibilityRules = pgTable(
  'option_compatibility_rules',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    productId: varchar('product_id', { length: 64 })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    primaryOptionId: varchar('primary_option_id', { length: 64 }).notNull(),
    incompatibleOptionId: varchar('incompatible_option_id', { length: 64 }).notNull(),
    message: text('message').notNull(),
  },
  (table) => [
    unique().on(table.productId, table.primaryOptionId, table.incompatibleOptionId),
    index('idx_compatibility_product').on(table.productId),
  ]
);

// 9. Carts
export const carts = pgTable(
  'carts',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .references(() => users.id, { onDelete: 'cascade' }),
    guestToken: text('guest_token').unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_carts_user_id').on(table.userId),
    index('idx_carts_guest_token').on(table.guestToken),
  ]
);

// 10. Cart Items
export const cartItems = pgTable(
  'cart_items',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    cartId: varchar('cart_id', { length: 64 })
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: varchar('product_id', { length: 64 })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    selectedOptions: jsonb('selected_options')
      .$type<Array<{
        groupId: string;
        groupName: string;
        optionId: string;
        label: string;
        priceDelta: number;
        swatchImageUrl?: string;
        colourValue?: string;
      }>>()
      .notNull(),
    quantity: integer('quantity').notNull().default(1),
    unitPriceAtAdd: integer('unit_price_at_add').notNull(), // paise
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_cart_items_cart_id').on(table.cartId),
    index('idx_cart_items_product_id').on(table.productId),
  ]
);

// 11. Addresses
export const addresses = pgTable(
  'addresses',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    phone: text('phone').notNull(),
    line1: text('line1').notNull(),
    line2: text('line2'),
    landmark: text('landmark'),
    city: text('city').notNull(),
    state: text('state').notNull(),
    pincode: text('pincode').notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_addresses_user_id').on(table.userId),
    uniqueIndex('idx_addresses_user_default')
      .on(table.userId)
      .where(sql`is_default = true`),
  ]
);

// 12. Orders
export const orders = pgTable(
  'orders',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    orderNumber: text('order_number').notNull().unique(),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    addressSnapshot: jsonb('address_snapshot').notNull(),
    subtotal: integer('subtotal').notNull(), // paise
    shipping: integer('shipping').notNull().default(0), // paise
    tax: integer('tax').notNull().default(0), // paise
    total: integer('total').notNull(), // paise
    currency: text('currency').notNull().default('INR'),
    status: text('status').notNull().default('placed'), // 'placed' | 'confirmed' | 'in_production' | 'packed' | 'dispatched' | 'delivered' | 'cancelled'
    paymentStatus: text('payment_status').notNull().default('pending'), // 'pending' | 'paid' | 'failed' | 'cancelled'
    paymentExpiresAt: timestamp('payment_expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_orders_user_id').on(table.userId),
    index('idx_orders_status').on(table.status),
    index('idx_orders_payment_status').on(table.paymentStatus),
    index('idx_orders_created_at').on(table.createdAt),
  ]
);

// 13. Order Items
export const orderItems = pgTable(
  'order_items',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    orderId: varchar('order_id', { length: 64 })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: varchar('product_id', { length: 64 }).notNull(),
    productName: text('product_name').notNull(),
    selectedOptionsText: text('selected_options_text').notNull(),
    selectedOptions: jsonb('selected_options').notNull(),
    unitPrice: integer('unit_price').notNull(), // paise
    quantity: integer('quantity').notNull(),
    lineTotal: integer('line_total').notNull(), // paise
  },
  (table) => [
    index('idx_order_items_order_id').on(table.orderId),
  ]
);

// 14. Payments
export const payments = pgTable(
  'payments',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    orderId: varchar('order_id', { length: 64 })
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),
    gateway: text('gateway').notNull(), // 'fake' | 'razorpay'
    gatewayOrderId: text('gateway_order_id'),
    gatewayPaymentId: text('gateway_payment_id'),
    amount: integer('amount').notNull(), // paise
    currency: text('currency').notNull().default('INR'),
    status: text('status').notNull().default('pending'), // 'pending' | 'paid' | 'failed' | 'cancelled'
    rawResponse: jsonb('raw_response'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_payments_order_id').on(table.orderId),
    index('idx_payments_gateway_order').on(table.gatewayOrderId),
  ]
);

// 15. Payment Events (Webhook Idempotency)
export const paymentEvents = pgTable(
  'payment_events',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    gateway: text('gateway').notNull(),
    eventId: text('event_id').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_payment_events_unique').on(table.gateway, table.eventId),
  ]
);

// 16. Idempotency Keys (Scoped to User + Endpoint)
export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    key: text('key').notNull(),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    requestHash: text('request_hash').notNull(),
    responseStatus: integer('response_status').notNull(),
    responseBody: jsonb('response_body').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_idempotency_user_key_endpoint').on(table.key, table.userId, table.endpoint),
  ]
);

// 17. Contact Messages
export const contactMessages = pgTable(
  'contact_messages',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    message: text('message').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_contact_messages_created_at').on(table.createdAt),
  ]
);

// 18. Order Status History
export const orderStatusHistory = pgTable(
  'order_status_history',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    orderId: varchar('order_id', { length: 64 })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    fromStatus: text('from_status').notNull(),
    toStatus: text('to_status').notNull(),
    changedBy: text('changed_by').notNull(), // 'system' | user_id | staff_id
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_order_status_history_order').on(table.orderId),
  ]
);
