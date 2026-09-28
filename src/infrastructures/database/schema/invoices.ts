import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").references(() => orders.id),
    recipient: varchar("recipient", { length: 255 }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
    status: varchar("status", { length: 30 }).notNull().default("PENDING"),
    deadline: date("deadline").notNull(),
    orderDate: date("order_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_order_id").on(table.orderId),
    index("recipient_lowercase_trgm").using(
      "gin",
      sql`LOWER(${table.recipient}) gin_trgm_ops`
    ),
  ]
);