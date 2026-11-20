import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IWalletRepository } from '../../../domain/repositories/wallet.repository.interface.js';
import { WALLET_REPOSITORY } from '../../../domain/repositories/wallet.repository.interface.js';
import type { ITaxConfigRepository } from '../../../domain/repositories/tax-config.repository.interface.js';
import { TAX_CONFIG_REPOSITORY } from '../../../domain/repositories/tax-config.repository.interface.js';
import type { ICashflowTransactionRepository } from '../../../domain/repositories/cashflow-transaction.repository.interface.js';
import { CASHFLOW_TRANSACTION_REPOSITORY } from '../../../domain/repositories/cashflow-transaction.repository.interface.js';
import { RecordManualOutcomeDto } from '../../dto/outcome/record-manual-outcome.dto.js';
import { CashflowTransactionEntity } from '../../../domain/entities/cashflow-transaction.entity.js';

@Injectable()
export class RecordManualOutcomeUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(TAX_CONFIG_REPOSITORY)
    private readonly taxConfigRepository: ITaxConfigRepository,
    @Inject(CASHFLOW_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ICashflowTransactionRepository,
  ) {}

  async execute(
    userId: string,
    dto: RecordManualOutcomeDto,
  ): Promise<{
    transaction: CashflowTransactionEntity;
    updatedBalance: number;
  }> {
    const wallet = await this.walletRepository.findById(dto.walletId, userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const baseAmount = Number(dto.baseAmount);

    let taxRate = dto.taxRatePercent;
    if (taxRate === undefined) {
      const defaultTax =
        await this.taxConfigRepository.findDefaultByUserId(userId);
      taxRate = defaultTax ? defaultTax.ratePercent : 0;
    }

    const predictedTax = Math.round(baseAmount * (taxRate / 100) * 100) / 100;
    const actualTax =
      dto.actualTax !== undefined ? Number(dto.actualTax) : predictedTax;
    const totalAmount = baseAmount + actualTax;

    const transaction = await this.transactionRepository.create({
      userId,
      type: 'OUTCOME',
      mode: 'MANUAL',
      walletId: dto.walletId,
      categoryId: dto.categoryId,
      baseAmount,
      taxRatePercent: taxRate,
      predictedTax,
      actualTax,
      totalAmount,
      channel: dto.channel ?? 'OFFLINE',
      purpose: dto.purpose,
      forMember: dto.forMember,
      sourceOrMerchant: dto.merchant,
      notes: dto.notes,
      transactionDate: dto.transactionDate
        ? new Date(dto.transactionDate)
        : new Date(),
    });

    await this.walletRepository.decrementBalance(dto.walletId, totalAmount);
    const updatedWallet = await this.walletRepository.findById(
      dto.walletId,
      userId,
    );

    return {
      transaction,
      updatedBalance:
        updatedWallet?.currentBalance ?? wallet.currentBalance - totalAmount,
    };
  }
}
