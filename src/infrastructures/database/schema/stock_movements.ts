import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  integer,
  index,
} from "drizzle-orm/pg-core";
  
import { warehouseLocations } from './warehouse_locations';
import { inventoryBatches } from './inventory_batches';

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => inventoryBatches.id),
    fromLocationId: uuid("from_location_id").references(
      () => warehouseLocations.id
    ),
    toLocationId: uuid("to_location_id").references(
      () => warehouseLocations.id
    ),
    quantity: integer("quantity").notNull(),
    movementType: varchar("movement_type", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_stock_movements_batch_id").on(table.batchId),
    index("idx_stock_movements_created_at").on(table.createdAt),
  ]
);