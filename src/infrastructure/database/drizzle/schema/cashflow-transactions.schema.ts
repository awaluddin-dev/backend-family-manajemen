import {
  pgTable,
  uuid,
  varchar,
  numeric,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema.js';
import { walletsTable } from './wallets.schema.js';
import { categoriesTable } from './categories.schema.js';
import { recurringSchedulesTable } from './recurring-schedules.schema.js';

export const cashflowTransactionsTable = pgTable('cashflow_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'INCOME', 'OUTCOME'
  mode: varchar('mode', { length: 20 }).notNull(), // 'MANUAL', 'AUTO'
  recurringScheduleId: uuid('recurring_schedule_id').references(
    () => recurringSchedulesTable.id,
    { onDelete: 'set null' },
  ),
  walletId: uuid('wallet_id')
    .references(() => walletsTable.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: uuid('category_id').references(() => categoriesTable.id, {
    onDelete: 'set null',
  }),
  baseAmount: numeric('base_amount', { precision: 15, scale: 2 }).notNull(),
  taxRatePercent: numeric('tax_rate_percent', {
    precision: 5,
    scale: 2,
  }).default('0'),
  predictedTax: numeric('predicted_tax', { precision: 15, scale: 2 }).default(
    '0',
  ),
  actualTax: numeric('actual_tax', { precision: 15, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  channel: varchar('channel', { length: 20 }).default('OFFLINE'), // 'ONLINE', 'OFFLINE'
  purpose: varchar('purpose', { length: 255 }), // e.g. "Baju Lebaran", "Makan Siang"
  forMember: varchar('for_member', { length: 100 }), // e.g. "Ayah", "Ibu", "Anak 1"
  sourceOrMerchant: varchar('source_or_merchant', { length: 255 }), // e.g. "Shopee", "PT XYZ", "Tokopedia"
  notes: text('notes'),
  transactionDate: timestamp('transaction_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type CashflowTransactionSelect =
  typeof cashflowTransactionsTable.$inferSelect;
export type CashflowTransactionInsert =
  typeof cashflowTransactionsTable.$inferInsert;
