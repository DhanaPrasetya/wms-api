import { sql } from 'drizzle-orm';
import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';

export const warehouseLocations = pgTable(
  'warehouse_locations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    location_code: varchar('location_code', { length: 50 }).notNull().unique(),
    zone: varchar('zone', { length: 50 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('location_code_lowercase_trgm').using(
      'gin',
      sql`LOWER(${table.location_code}) gin_trgm_ops`,
    ),
  ],
);
