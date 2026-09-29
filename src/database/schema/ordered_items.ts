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
    order_id: uuid('order_id')
      .references(() => orders.id)
      .notNull(),
    product_id: uuid('product_id')
      .references(() => products.id)
      .notNull(),
    quantity: integer('quantity').notNull(),
    price_per_quantity: numeric('price_per_quantity', {
      precision: 12,
      scale: 2,
    }).notNull(),
    total_price: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_ordered_items_order_id').on(table.order_id),
    index('idx_ordered_items_product_id').on(table.product_id),
  ],
);
