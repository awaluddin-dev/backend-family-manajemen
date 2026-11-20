import { Injectable } from '@nestjs/common';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { CashflowTransactionEntity } from '../../domain/entities/cashflow-transaction.entity.js';
import type {
  ICashflowTransactionRepository,
  CashflowQueryFilters,
} from '../../domain/repositories/cashflow-transaction.repository.interface.js';
import type * as schema from '../database/drizzle/schema/index.js';
import { cashflowTransactionsTable } from '../database/drizzle/schema/cashflow-transactions.schema.js';

@Injectable()
export class DrizzleCashflowTransactionRepository implements ICashflowTransactionRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(data: {
    userId: string;
    type: 'INCOME' | 'OUTCOME';
    mode: 'MANUAL' | 'AUTO';
    recurringScheduleId?: string;
    walletId: string;
    categoryId?: string;
    baseAmount: number;
    taxRatePercent?: number;
    predictedTax?: number;
    actualTax?: number;
    totalAmount: number;
    channel?: string;
    purpose?: string;
    forMember?: string;
    sourceOrMerchant?: string;
    notes?: string;
    transactionDate?: Date;
  }): Promise<CashflowTransactionEntity> {
    const inserted = await this.db
      .insert(cashflowTransactionsTable)
      .values({
        userId: data.userId,
        type: data.type,
        mode: data.mode,
        recurringScheduleId: data.recurringScheduleId ?? null,
        walletId: data.walletId,
        categoryId: data.categoryId ?? null,
        baseAmount: String(data.baseAmount),
        taxRatePercent: String(data.taxRatePercent ?? 0),
        predictedTax: String(data.predictedTax ?? 0),
        actualTax: String(data.actualTax ?? 0),
        totalAmount: String(data.totalAmount),
        channel: data.channel ?? 'OFFLINE',
        purpose: data.purpose ?? null,
        forMember: data.forMember ?? null,
        sourceOrMerchant: data.sourceOrMerchant ?? null,
        notes: data.notes ?? null,
        transactionDate: data.transactionDate ?? new Date(),
      })
      .returning();

    const r = inserted[0];
    return new CashflowTransactionEntity({
      id: r.id,
      userId: r.userId,
      type: r.type as 'INCOME' | 'OUTCOME',
      mode: r.mode as 'MANUAL' | 'AUTO',
      recurringScheduleId: r.recurringScheduleId,
      walletId: r.walletId,
      categoryId: r.categoryId,
      baseAmount: Number(r.baseAmount),
      taxRatePercent: Number(r.taxRatePercent),
      predictedTax: Number(r.predictedTax),
      actualTax: Number(r.actualTax),
      totalAmount: Number(r.totalAmount),
      channel: r.channel,
      purpose: r.purpose,
      forMember: r.forMember,
      sourceOrMerchant: r.sourceOrMerchant,
      notes: r.notes,
      transactionDate: r.transactionDate,
      createdAt: r.createdAt,
    });
  }

  async findById(
    id: string,
    userId: string,
  ): Promise<CashflowTransactionEntity | null> {
    const rows = await this.db
      .select()
      .from(cashflowTransactionsTable)
      .where(
        and(
          eq(cashflowTransactionsTable.id, id),
          eq(cashflowTransactionsTable.userId, userId),
        ),
      )
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return new CashflowTransactionEntity({
      id: r.id,
      userId: r.userId,
      type: r.type as 'INCOME' | 'OUTCOME',
      mode: r.mode as 'MANUAL' | 'AUTO',
      recurringScheduleId: r.recurringScheduleId,
      walletId: r.walletId,
      categoryId: r.categoryId,
      baseAmount: Number(r.baseAmount),
      taxRatePercent: Number(r.taxRatePercent),
      predictedTax: Number(r.predictedTax),
      actualTax: Number(r.actualTax),
      totalAmount: Number(r.totalAmount),
      channel: r.channel,
      purpose: r.purpose,
      forMember: r.forMember,
      sourceOrMerchant: r.sourceOrMerchant,
      notes: r.notes,
      transactionDate: r.transactionDate,
      createdAt: r.createdAt,
    });
  }

  async findWithFilters(
    filters: CashflowQueryFilters,
  ): Promise<CashflowTransactionEntity[]> {
    const conditions = [eq(cashflowTransactionsTable.userId, filters.userId)];

    if (filters.type) {
      conditions.push(eq(cashflowTransactionsTable.type, filters.type));
    }
    if (filters.mode) {
      conditions.push(eq(cashflowTransactionsTable.mode, filters.mode));
    }
    if (filters.walletId) {
      conditions.push(eq(cashflowTransactionsTable.walletId, filters.walletId));
    }
    if (filters.categoryId) {
      conditions.push(
        eq(cashflowTransactionsTable.categoryId, filters.categoryId),
      );
    }
    if (filters.channel) {
      conditions.push(eq(cashflowTransactionsTable.channel, filters.channel));
    }
    if (filters.forMember) {
      conditions.push(
        eq(cashflowTransactionsTable.forMember, filters.forMember),
      );
    }
    if (filters.startDate) {
      conditions.push(
        gte(cashflowTransactionsTable.transactionDate, filters.startDate),
      );
    }
    if (filters.endDate) {
      conditions.push(
        lte(cashflowTransactionsTable.transactionDate, filters.endDate),
      );
    }

    const rows = await this.db
      .select()
      .from(cashflowTransactionsTable)
      .where(and(...conditions))
      .orderBy(desc(cashflowTransactionsTable.transactionDate));

    return rows.map(
      (r) =>
        new CashflowTransactionEntity({
          id: r.id,
          userId: r.userId,
          type: r.type as 'INCOME' | 'OUTCOME',
          mode: r.mode as 'MANUAL' | 'AUTO',
          recurringScheduleId: r.recurringScheduleId,
          walletId: r.walletId,
          categoryId: r.categoryId,
          baseAmount: Number(r.baseAmount),
          taxRatePercent: Number(r.taxRatePercent),
          predictedTax: Number(r.predictedTax),
          actualTax: Number(r.actualTax),
          totalAmount: Number(r.totalAmount),
          channel: r.channel,
          purpose: r.purpose,
          forMember: r.forMember,
          sourceOrMerchant: r.sourceOrMerchant,
          notes: r.notes,
          transactionDate: r.transactionDate,
          createdAt: r.createdAt,
        }),
    );
  }

  async getSummary(filters: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalIncome: number;
    totalOutcome: number;
    netCashflow: number;
  }> {
    const transactions = await this.findWithFilters({
      userId: filters.userId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });

    let totalIncome = 0;
    let totalOutcome = 0;

    for (const tx of transactions) {
      if (tx.type === 'INCOME') {
        totalIncome += tx.totalAmount;
      } else if (tx.type === 'OUTCOME') {
        totalOutcome += tx.totalAmount;
      }
    }

    return {
      totalIncome,
      totalOutcome,
      netCashflow: totalIncome - totalOutcome,
    };
  }
}
