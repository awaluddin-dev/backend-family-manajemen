import {
  pgTable,
  uuid,
  varchar,
  numeric,
  integer,
  date,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema.js';
import { walletsTable } from './wallets.schema.js';
import { categoriesTable } from './categories.schema.js';

export const recurringSchedulesTable = pgTable('recurring_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'INCOME', 'OUTCOME'
  walletId: uuid('wallet_id')
    .references(() => walletsTable.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: uuid('category_id').references(() => categoriesTable.id, {
    onDelete: 'set null',
  }),
  frequency: varchar('frequency', { length: 20 }).default('MONTHLY').notNull(), // 'MONTHLY', 'WEEKLY', 'YEARLY'
  dayOfMonth: integer('day_of_month').default(1).notNull(), // 1-31
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(), // Net amount to be recorded
  nextExecutionDate: date('next_execution_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  forMember: varchar('for_member', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const recurringBreakdownItemsTable = pgTable(
  'recurring_breakdown_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    scheduleId: uuid('schedule_id')
      .references(() => recurringSchedulesTable.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(), // e.g. "Gaji Pokok", "Tunjangan", "Potongan PPh 21"
    itemType: varchar('item_type', { length: 20 }).notNull(), // 'ALLOWANCE' (penambah), 'DEDUCTION' (pengurang)
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  },
);

export type RecurringScheduleSelect =
  typeof recurringSchedulesTable.$inferSelect;
export type RecurringScheduleInsert =
  typeof recurringSchedulesTable.$inferInsert;
export type RecurringBreakdownItemSelect =
  typeof recurringBreakdownItemsTable.$inferSelect;
export type RecurringBreakdownItemInsert =
  typeof recurringBreakdownItemsTable.$inferInsert;
