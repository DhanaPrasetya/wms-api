import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  timestamp,
  integer,
  unique,
  index,
  check
} from "drizzle-orm/pg-core";
  
import { warehouseLocations } from './warehouse_locations';
import { inventoryBatches } from './inventory_batches';

export const inventoryStock = pgTable(
  "inventory_stocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => warehouseLocations.id),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => inventoryBatches.id),
    quantityOnHand: integer("quantity_on_hand").notNull().default(0),
    reservedQuantity: integer("reserved_quantity").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_inventory_stock_location_id").on(table.locationId),
    index("idx_inventory_stock_batch_id").on(table.batchId),
    unique("inventory_stock_location_id_batch_id_unique").on(
      table.locationId,
      table.batchId
    ),
    check("quantity_on_hand_check", sql`${table.quantityOnHand} >= 0`),
    check("reserved_quantity_check", sql`${table.reservedQuantity} >= 0`),
  ]
);