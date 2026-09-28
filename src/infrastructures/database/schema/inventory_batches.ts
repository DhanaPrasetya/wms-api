import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import {products} from "./products";

export const inventoryBatches = pgTable(
  "inventory_batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    batchNumber: varchar("batch_number", { length: 100 }).notNull(),
    expDate: timestamp("exp_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_inventory_batches_product_id").on(table.productId),
    index("idx_batch_number").on(table.batchNumber),
    index("idx_exp_date").on(table.expDate),
    unique("inventory_batches_product_id_batch_number_unique").on(
      table.productId,
      table.batchNumber
    ),
  ]
);