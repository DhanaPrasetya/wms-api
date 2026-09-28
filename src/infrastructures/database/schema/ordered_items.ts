import {
  pgTable,
  uuid,
  integer,
  timestamp,
  index,
  numeric,
} from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { products } from './products';

export const orderedItems = pgTable(
  'ordered_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').references(() => orders.id),
    productId: uuid('product_id').references(() => products.id),
    quantity: integer('quantity').notNull(),
    pricePerQuantity: numeric('price_per_quantity', {
      precision: 12,
      scale: 2,
    }).notNull(),
    totalPrice: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_ordered_items_order_id').on(table.orderId),
    index('idx_ordered_items_product_id').on(table.productId),
  ],
);
