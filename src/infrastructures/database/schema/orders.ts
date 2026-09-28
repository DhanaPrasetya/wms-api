import { sql, relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { orderedItems } from './ordered_items';
import { invoices } from './invoices';

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    status: varchar('status', { length: 30 }).notNull().default('PENDING'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_pending_orders')
      .on(table.createdAt)
      .where(sql`${table.status} = 'PENDING'`),
  ],
);

export const ordersRelations = relations(orders, ({ many }) => ({
  invoices: many(invoices),
  orderedItems: many(orderedItems),
}));
