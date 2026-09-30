import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  index,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { orderedItems } from './ordered_items';
import { inventoryBatches } from './inventory_batches';
import { uomMetrics } from './uom_metrics';

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    ean_code: varchar('ean_code', { length: 20 }).notNull().unique(),
    description: text('description'),
    photo: varchar('photo', { length: 255 }),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_products_lower_name_trgm').using(
      'gin',
      sql`LOWER(${table.name}) gin_trgm_ops`,
    ),
    index('idx_ean_code').on(table.ean_code),
  ],
);

export const productsRelations = relations(products, ({ many }) => ({
  uomMetrics: many(uomMetrics),
  inventoryBatches: many(inventoryBatches),
  orderedItems: many(orderedItems),
}));
