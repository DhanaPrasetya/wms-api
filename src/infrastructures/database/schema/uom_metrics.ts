import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import {products} from "./products";

export const uomMetrics = pgTable(
  "uom_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "restrict",
    }),
    itf14: varchar("itf_14", { length: 14 }).notNull().unique(),
    uomName: varchar("uom_name", { length: 50 }).notNull(),
    multiplier: integer("multiplier").notNull().default(1),
    metricName: varchar("metric_name", { length: 50 }),
    isBaseUom: boolean("is_base_uom").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_product_id").on(table.productId)]
);