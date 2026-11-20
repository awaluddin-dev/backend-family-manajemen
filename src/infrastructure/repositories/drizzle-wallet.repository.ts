import { Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { WalletEntity } from '../../domain/entities/wallet.entity.js';
import type { IWalletRepository } from '../../domain/repositories/wallet.repository.interface.js';
import type * as schema from '../database/drizzle/schema/index.js';
import { walletsTable } from '../database/drizzle/schema/wallets.schema.js';

@Injectable()
export class DrizzleWalletRepository implements IWalletRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findById(id: string, userId: string): Promise<WalletEntity | null> {
    const rows = await this.db
      .select()
      .from(walletsTable)
      .where(and(eq(walletsTable.id, id), eq(walletsTable.userId, userId)))
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return new WalletEntity({
      id: r.id,
      userId: r.userId,
      name: r.name,
      type: r.type,
      currentBalance: Number(r.currentBalance),
      accountNumber: r.accountNumber,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<WalletEntity[]> {
    const rows = await this.db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.userId, userId));

    return rows.map(
      (r) =>
        new WalletEntity({
          id: r.id,
          userId: r.userId,
          name: r.name,
          type: r.type,
          currentBalance: Number(r.currentBalance),
          accountNumber: r.accountNumber,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }),
    );
  }

  async create(wallet: {
    userId: string;
    name: string;
    type: string;
    initialBalance?: number;
    accountNumber?: string;
  }): Promise<WalletEntity> {
    const inserted = await this.db
      .insert(walletsTable)
      .values({
        userId: wallet.userId,
        name: wallet.name,
        type: wallet.type,
        currentBalance: String(wallet.initialBalance ?? 0),
        accountNumber: wallet.accountNumber ?? null,
      })
      .returning();

    const r = inserted[0];
    return new WalletEntity({
      id: r.id,
      userId: r.userId,
      name: r.name,
      type: r.type,
      currentBalance: Number(r.currentBalance),
      accountNumber: r.accountNumber,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  async updateBalance(id: string, newBalance: number): Promise<void> {
    await this.db
      .update(walletsTable)
      .set({ currentBalance: String(newBalance), updatedAt: new Date() })
      .where(eq(walletsTable.id, id));
  }

  async incrementBalance(id: string, amount: number): Promise<void> {
    await this.db
      .update(walletsTable)
      .set({
        currentBalance: sql`${walletsTable.currentBalance} + ${String(amount)}`,
        updatedAt: new Date(),
      })
      .where(eq(walletsTable.id, id));
  }

  async decrementBalance(id: string, amount: number): Promise<void> {
    await this.db
      .update(walletsTable)
      .set({
        currentBalance: sql`${walletsTable.currentBalance} - ${String(amount)}`,
        updatedAt: new Date(),
      })
      .where(eq(walletsTable.id, id));
  }
}
