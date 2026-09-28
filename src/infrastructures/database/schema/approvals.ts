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
    requestedBy: uuid('requested_by')
      .notNull()
      .references(() => users.id),
    reviewerRoleId: uuid('reviewer_role_id')
      .notNull()
      .references(() => roles.id),
    approvalType: varchar('approval_type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('PENDING'),
    reviewedBy: uuid('reviewed_by').references(() => users.id),
    rejectionReason: text('rejection_reason'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_approvals_status_type').on(table.status, table.approvalType),
  ],
);

export const approvalsRelations = relations(approvals, ({ one }) => ({
  requestedByUser: one(users, {
    fields: [approvals.requestedBy],
    references: [users.id],
    relationName: 'requestedBy',
  }),
  reviewerRole: one(roles, {
    fields: [approvals.reviewerRoleId],
    references: [roles.id],
  }),
  reviewedByUser: one(users, {
    fields: [approvals.reviewedBy],
    references: [users.id],
    relationName: 'reviewedBy',
  }),
}));
