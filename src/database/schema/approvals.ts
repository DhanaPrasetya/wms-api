import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { roles } from './roles';

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    requested_by: uuid('requested_by')
      .notNull()
      .references(() => users.id),
    reviewer_role_id: uuid('reviewer_role_id')
      .notNull()
      .references(() => roles.id),
    approval_type: varchar('approval_type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('PENDING'),
    reviewed_by: uuid('reviewed_by')
      .references(() => users.id)
      .notNull(),
    rejection_reason: text('rejection_reason'),
    reviewed_at: timestamp('reviewed_at', { withTimezone: true }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_approvals_status_type').on(table.status, table.approval_type),
  ],
);

export const approvalsRelations = relations(approvals, ({ one }) => ({
  requestedByUser: one(users, {
    fields: [approvals.requested_by],
    references: [users.id],
    relationName: 'requestedBy',
  }),
  reviewerRole: one(roles, {
    fields: [approvals.reviewer_role_id],
    references: [roles.id],
  }),
  reviewedByUser: one(users, {
    fields: [approvals.reviewed_by],
    references: [users.id],
    relationName: 'reviewedBy',
  }),
}));
