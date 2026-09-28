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
    roleId: uuid('role_id').references(() => roles.id, {
      onDelete: 'restrict',
    }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_users_name_trgm').using(
      'gin',
      sql`LOWER(${table.name}) gin_trgm_ops`,
    ),
    index('idx_role_id').on(table.roleId),
    index('idx_email').on(table.email),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  activityLogs: many(activityLogs),
  requestedApprovals: many(approvals, { relationName: 'requestedBy' }),
  reviewedApprovals: many(approvals, { relationName: 'reviewedBy' }),
}));
