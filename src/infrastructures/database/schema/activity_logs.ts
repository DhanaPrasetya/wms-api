import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  text,
  boolean
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    operation: varchar("operation", { length: 20 }),
    ai_agent: boolean("ai_agent").default(false),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_user_id_n_ai_agent").on(table.userId, table.ai_agent),
    index("idx_operation_timestamp").on(table.operation, table.createdAt.desc()),
  ]
);