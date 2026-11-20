import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import type * as schema from './schema/index.js';

@Injectable()
export class DatabaseBootstrapService implements OnApplicationBootstrap {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async onApplicationBootstrap() {
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
        account_number VARCHAR(100),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        icon VARCHAR(100),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tax_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        rate_percent NUMERIC(5, 2) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS recurring_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
        day_of_month INT NOT NULL DEFAULT 1,
        total_amount NUMERIC(15, 2) NOT NULL,
        next_execution_date DATE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        for_member VARCHAR(100),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS recurring_breakdown_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schedule_id UUID NOT NULL REFERENCES recurring_schedules(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        item_type VARCHAR(20) NOT NULL,
        amount NUMERIC(15, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cashflow_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        mode VARCHAR(20) NOT NULL,
        recurring_schedule_id UUID REFERENCES recurring_schedules(id) ON DELETE SET NULL,
        wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        base_amount NUMERIC(15, 2) NOT NULL,
        tax_rate_percent NUMERIC(5, 2) DEFAULT 0,
        predicted_tax NUMERIC(15, 2) DEFAULT 0,
        actual_tax NUMERIC(15, 2) DEFAULT 0,
        total_amount NUMERIC(15, 2) NOT NULL,
        channel VARCHAR(20) DEFAULT 'OFFLINE',
        purpose VARCHAR(255),
        for_member VARCHAR(100),
        source_or_merchant VARCHAR(255),
        notes TEXT,
        transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }
}
