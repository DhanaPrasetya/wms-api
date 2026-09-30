import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  timestamp,
  integer,
  unique,
  index,
  check,
} from 'drizzle-orm/pg-core';

import { warehouseLocations } from './warehouse_locations';
import { inventoryBatches } from './inventory_batches';

export const inventoryStock = pgTable(
  'inventory_stocks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    location_id: uuid('location_id')
      .notNull()
      .references(() => warehouseLocations.id),
    batch_id: uuid('batch_id')
      .notNull()
      .references(() => inventoryBatches.id),
    quantity_on_hand: integer('quantity_on_hand').notNull().default(0),
    reserved_quantity: integer('reserved_quantity').notNull().default(0),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_inventory_stock_location_id').on(table.location_id),
    index('idx_inventory_stock_batch_id').on(table.batch_id),
    unique('inventory_stock_location_id_batch_id_unique').on(
      table.location_id,
      table.batch_id,
    ),
    check('quantity_on_hand_check', sql`${table.quantity_on_hand} >= 0`),
    check('reserved_quantity_check', sql`${table.reserved_quantity} >= 0`),
  ],
);
