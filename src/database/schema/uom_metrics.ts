import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { products } from './products';

export const uomMetrics = pgTable(
  'uom_metrics',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    product_id: uuid('product_id')
      .references(() => products.id, {
        onDelete: 'restrict',
      })
      .notNull(),
    itf_14: varchar('itf_14', { length: 14 }).notNull().unique(),
    uom_name: varchar('uom_name', { length: 50 }).notNull(),
    multiplier: integer('multiplier').notNull().default(1),
    metric_name: varchar('metric_name', { length: 50 }).notNull(),
    is_base_uom: boolean('is_base_uom').default(false).notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [index('idx_product_id').on(table.product_id)],
);
