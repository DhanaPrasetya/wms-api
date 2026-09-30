import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { approvals } from './approvals';
import { users } from './users';

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  requiredApprovals: many(approvals),
}));
