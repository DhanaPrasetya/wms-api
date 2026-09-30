import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { roles } from './roles';
import { approvals } from './approvals';
import { activityLogs } from './activity_logs';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    role_id: uuid('role_id')
      .references(() => roles.id, {
        onDelete: 'restrict',
      })
      .notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    is_active: boolean('is_active').default(true).notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_users_name_trgm').using(
      'gin',
      sql`LOWER(${table.name}) gin_trgm_ops`,
    ),
    index('idx_role_id').on(table.role_id),
    index('idx_email').on(table.email),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.role_id], references: [roles.id] }),
  activityLogs: many(activityLogs),
  requestedApprovals: many(approvals, { relationName: 'requestedBy' }),
  reviewedApprovals: many(approvals, { relationName: 'reviewedBy' }),
}));
