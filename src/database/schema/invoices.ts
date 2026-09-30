import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  numeric,
  date,
} from 'drizzle-orm/pg-core';
import { orders } from './orders';

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    order_id: uuid('order_id')
      .references(() => orders.id)
      .notNull(),
    recipient: varchar('recipient', { length: 255 }).notNull(),
    total_amount: numeric('total_amount', {
      precision: 12,
      scale: 2,
    }).notNull(),
    status: varchar('status', { length: 30 }).notNull().default('PENDING'),
    deadline: date('deadline').notNull(),
    order_date: date('order_date').notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_order_id').on(table.order_id),
    index('recipient_lowercase_trgm').using(
      'gin',
      sql`LOWER(${table.recipient}) gin_trgm_ops`,
    ),
  ],
);
