import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  text,
  boolean,
} from 'drizzle-orm/pg-core';

import { users } from './users';

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    operation: varchar('operation', { length: 20 }).notNull(),
    ai_agent: boolean('ai_agent').default(false).notNull(),
    description: text('description'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_user_id_n_ai_agent').on(table.user_id, table.ai_agent),
    index('idx_operation_timestamp').on(
      table.operation,
      table.created_at.desc(),
    ),
  ],
);
