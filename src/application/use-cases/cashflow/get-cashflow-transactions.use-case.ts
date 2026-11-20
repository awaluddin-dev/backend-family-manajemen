import { Inject, Injectable } from '@nestjs/common';
import type { ICashflowTransactionRepository } from '../../../domain/repositories/cashflow-transaction.repository.interface.js';
import { CASHFLOW_TRANSACTION_REPOSITORY } from '../../../domain/repositories/cashflow-transaction.repository.interface.js';
import { CashflowFilterDto } from '../../dto/cashflow/cashflow-filter.dto.js';
import { CashflowTransactionEntity } from '../../../domain/entities/cashflow-transaction.entity.js';

@Injectable()
export class GetCashflowTransactionsUseCase {
  constructor(
    @Inject(CASHFLOW_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ICashflowTransactionRepository,
  ) {}

  async execute(
    userId: string,
    filter: CashflowFilterDto,
  ): Promise<CashflowTransactionEntity[]> {
    return this.transactionRepository.findWithFilters({
      userId,
      type: filter.type,
      mode: filter.mode,
      walletId: filter.walletId,
      categoryId: filter.categoryId,
      channel: filter.channel,
      forMember: filter.forMember,
      startDate: filter.startDate ? new Date(filter.startDate) : undefined,
      endDate: filter.endDate ? new Date(filter.endDate) : undefined,
    });
  }
}
