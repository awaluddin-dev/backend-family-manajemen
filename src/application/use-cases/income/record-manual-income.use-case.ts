import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IWalletRepository } from '../../../domain/repositories/wallet.repository.interface.js';
import { WALLET_REPOSITORY } from '../../../domain/repositories/wallet.repository.interface.js';
import type { ICashflowTransactionRepository } from '../../../domain/repositories/cashflow-transaction.repository.interface.js';
import { CASHFLOW_TRANSACTION_REPOSITORY } from '../../../domain/repositories/cashflow-transaction.repository.interface.js';
import { RecordManualIncomeDto } from '../../dto/income/record-manual-income.dto.js';
import { CashflowTransactionEntity } from '../../../domain/entities/cashflow-transaction.entity.js';

@Injectable()
export class RecordManualIncomeUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(CASHFLOW_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ICashflowTransactionRepository,
  ) {}

  async execute(
    userId: string,
    dto: RecordManualIncomeDto,
  ): Promise<{
    transaction: CashflowTransactionEntity;
    updatedBalance: number;
  }> {
    const wallet = await this.walletRepository.findById(dto.walletId, userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found or access denied');
    }

    const amount = Number(dto.amount);
    const transaction = await this.transactionRepository.create({
      userId,
      type: 'INCOME',
      mode: 'MANUAL',
      walletId: dto.walletId,
      categoryId: dto.categoryId,
      baseAmount: amount,
      totalAmount: amount,
      sourceOrMerchant: dto.source ?? 'Manual Income',
      forMember: dto.forMember,
      notes: dto.notes,
      transactionDate: dto.transactionDate
        ? new Date(dto.transactionDate)
        : new Date(),
    });

    await this.walletRepository.incrementBalance(dto.walletId, amount);
    const updatedWallet = await this.walletRepository.findById(
      dto.walletId,
      userId,
    );

    return {
      transaction,
      updatedBalance:
        updatedWallet?.currentBalance ?? wallet.currentBalance + amount,
    };
  }
}
