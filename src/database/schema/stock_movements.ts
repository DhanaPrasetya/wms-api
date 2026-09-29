import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  integer,
  index,
} from 'drizzle-orm/pg-core';

import { warehouseLocations } from './warehouse_locations';
import { inventoryBatches } from './inventory_batches';

export const stockMovements = pgTable(
  'stock_movements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    batch_id: uuid('batch_id')
      .notNull()
      .references(() => inventoryBatches.id),
    from_location_id: uuid('from_location_id')
      .references(() => warehouseLocations.id)
      .notNull(),
    to_location_id: uuid('to_location_id')
      .references(() => warehouseLocations.id)
      .notNull(),
    quantity: integer('quantity').notNull(),
    movement_type: varchar('movement_type', { length: 50 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_stock_movements_batch_id').on(table.batch_id),
    index('idx_stock_movements_created_at').on(table.created_at),
  ],
);
