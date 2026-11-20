import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema.js';

export const walletsTable = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'BANK', 'E_WALLET', 'CASH', 'POINT'
  currentBalance: numeric('current_balance', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),
  accountNumber: varchar('account_number', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type WalletSelect = typeof walletsTable.$inferSelect;
export type WalletInsert = typeof walletsTable.$inferInsert;
