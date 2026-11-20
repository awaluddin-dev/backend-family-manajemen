import { CashflowTransactionEntity } from '../entities/cashflow-transaction.entity.js';

export const CASHFLOW_TRANSACTION_REPOSITORY = Symbol(
  'CASHFLOW_TRANSACTION_REPOSITORY',
);

export interface CashflowQueryFilters {
  userId: string;
  type?: 'INCOME' | 'OUTCOME';
  mode?: 'MANUAL' | 'AUTO';
  walletId?: string;
  categoryId?: string;
  channel?: 'ONLINE' | 'OFFLINE';
  forMember?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ICashflowTransactionRepository {
  create(data: {
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
  }): Promise<CashflowTransactionEntity>;
  findById(
    id: string,
    userId: string,
  ): Promise<CashflowTransactionEntity | null>;
  findWithFilters(
    filters: CashflowQueryFilters,
  ): Promise<CashflowTransactionEntity[]>;
  getSummary(filters: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalIncome: number;
    totalOutcome: number;
    netCashflow: number;
  }>;
}
