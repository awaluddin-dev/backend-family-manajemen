import { Inject, Injectable } from '@nestjs/common';
import type { IWalletRepository } from '../../../domain/repositories/wallet.repository.interface.js';
import { WALLET_REPOSITORY } from '../../../domain/repositories/wallet.repository.interface.js';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface.js';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/category.repository.interface.js';
import type { ICashflowTransactionRepository } from '../../../domain/repositories/cashflow-transaction.repository.interface.js';
import { CASHFLOW_TRANSACTION_REPOSITORY } from '../../../domain/repositories/cashflow-transaction.repository.interface.js';
import { WalletEntity } from '../../../domain/entities/wallet.entity.js';

export interface CashflowSummaryResult {
  overview: {
    totalIncome: number;
    totalOutcome: number;
    netCashflow: number;
    totalLiquidity: number;
  };
  wallets: {
    id: string;
    name: string;
    type: string;
    currentBalance: number;
  }[];
  byCategory: {
    categoryId: string | null;
    categoryName: string;
    type: 'INCOME' | 'OUTCOME';
    total: number;
    percentage: number;
  }[];
  byMember: {
    member: string;
    totalIncome: number;
    totalOutcome: number;
  }[];
  byChannel: {
    onlineTotal: number;
    offlineTotal: number;
  };
}

@Injectable()
export class GetCashflowSummaryUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(CASHFLOW_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ICashflowTransactionRepository,
  ) {}

  async execute(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CashflowSummaryResult> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const [wallets, categories, transactions] = await Promise.all([
      this.walletRepository.findByUserId(userId),
      this.categoryRepository.findByUserId(userId),
      this.transactionRepository.findWithFilters({
        userId,
        startDate: start,
        endDate: end,
      }),
    ]);

    const categoryMap = new Map<string, string>();
    for (const cat of categories) {
      categoryMap.set(cat.id, cat.name);
    }

    let totalIncome = 0;
    let totalOutcome = 0;
    let onlineTotal = 0;
    let offlineTotal = 0;

    const memberAggregation = new Map<
      string,
      { income: number; outcome: number }
    >();
    const categoryAggregation = new Map<
      string,
      { total: number; type: 'INCOME' | 'OUTCOME' }
    >();

    for (const tx of transactions) {
      if (tx.type === 'INCOME') {
        totalIncome += tx.totalAmount;
      } else {
        totalOutcome += tx.totalAmount;
      }

      if (tx.channel === 'ONLINE') {
        onlineTotal += tx.totalAmount;
      } else {
        offlineTotal += tx.totalAmount;
      }

      const member = tx.forMember ?? 'Bersama / Umum';
      const mStats = memberAggregation.get(member) ?? { income: 0, outcome: 0 };
      if (tx.type === 'INCOME') {
        mStats.income += tx.totalAmount;
      } else {
        mStats.outcome += tx.totalAmount;
      }
      memberAggregation.set(member, mStats);

      const catKey = tx.categoryId ?? 'uncategorized';
      const cStats = categoryAggregation.get(catKey) ?? {
        total: 0,
        type: tx.type,
      };
      cStats.total += tx.totalAmount;
      categoryAggregation.set(catKey, cStats);
    }

    const totalLiquidity = wallets.reduce(
      (acc: number, w: WalletEntity) => acc + w.currentBalance,
      0,
    );

    const byCategory = Array.from(categoryAggregation.entries()).map(
      ([catId, data]) => {
        const divisor = data.type === 'INCOME' ? totalIncome : totalOutcome;
        const percentage =
          divisor > 0 ? Math.round((data.total / divisor) * 10000) / 100 : 0;
        return {
          categoryId: catId === 'uncategorized' ? null : catId,
          categoryName:
            catId === 'uncategorized'
              ? 'Tanpa Kategori'
              : (categoryMap.get(catId) ?? 'Lain-lain'),
          type: data.type,
          total: data.total,
          percentage,
        };
      },
    );

    const byMember = Array.from(memberAggregation.entries()).map(
      ([member, stats]) => ({
        member,
        totalIncome: stats.income,
        totalOutcome: stats.outcome,
      }),
    );

    return {
      overview: {
        totalIncome,
        totalOutcome,
        netCashflow: totalIncome - totalOutcome,
        totalLiquidity,
      },
      wallets: wallets.map((w: WalletEntity) => ({
        id: w.id,
        name: w.name,
        type: w.type,
        currentBalance: w.currentBalance,
      })),
      byCategory,
      byMember,
      byChannel: {
        onlineTotal,
        offlineTotal,
      },
    };
  }
}
