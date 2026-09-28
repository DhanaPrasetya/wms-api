import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const warehouseLocations = pgTable(
  "warehouse_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    locationCode: varchar("location_code", { length: 50 }).notNull().unique(),
    zone: varchar("zone", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("location_code_lowercase_trgm").using(
      "gin",
      sql`LOWER(${table.locationCode}) gin_trgm_ops`
    ),
  ]
);