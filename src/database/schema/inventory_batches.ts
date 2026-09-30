import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { products } from './products';

export const inventoryBatches = pgTable(
  'inventory_batches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    product_id: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    batch_number: varchar('batch_number', { length: 100 }).notNull(),
    exp_date: timestamp('exp_date', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_inventory_batches_product_id').on(table.product_id),
    index('idx_batch_number').on(table.batch_number),
    index('idx_exp_date').on(table.exp_date),
    unique('inventory_batches_product_id_batch_number_unique').on(
      table.product_id,
      table.batch_number,
    ),
  ],
);
