import {
  pgTable,
  uuid,
  varchar,
  numeric,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema.js';

export const taxConfigsTable = pgTable('tax_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(), // e.g. 'PPN 11%', 'PPN 12%', 'PPh 21'
  ratePercent: numeric('rate_percent', { precision: 5, scale: 2 }).notNull(), // e.g. 11.00
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type TaxConfigSelect = typeof taxConfigsTable.$inferSelect;
export type TaxConfigInsert = typeof taxConfigsTable.$inferInsert;
