import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IWalletRepository } from '../../../domain/repositories/wallet.repository.interface.js';
import { WALLET_REPOSITORY } from '../../../domain/repositories/wallet.repository.interface.js';
import type { IRecurringScheduleRepository } from '../../../domain/repositories/recurring-schedule.repository.interface.js';
import { RECURRING_SCHEDULE_REPOSITORY } from '../../../domain/repositories/recurring-schedule.repository.interface.js';
import type { ICashflowTransactionRepository } from '../../../domain/repositories/cashflow-transaction.repository.interface.js';
import { CASHFLOW_TRANSACTION_REPOSITORY } from '../../../domain/repositories/cashflow-transaction.repository.interface.js';

export interface ProcessedScheduleResult {
  scheduleId: string;
  title: string;
  type: 'INCOME' | 'OUTCOME';
  amount: number;
  walletId: string;
}

@Injectable()
export class ProcessDueRecurringSchedulesUseCase {
  private readonly logger = new Logger(
    ProcessDueRecurringSchedulesUseCase.name,
  );

  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(RECURRING_SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: IRecurringScheduleRepository,
    @Inject(CASHFLOW_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ICashflowTransactionRepository,
  ) {}

  async execute(targetDateStr?: string): Promise<ProcessedScheduleResult[]> {
    const dateStr = targetDateStr ?? new Date().toISOString().split('T')[0];
    const dueSchedules =
      await this.scheduleRepository.findDueSchedules(dateStr);

    const processed: ProcessedScheduleResult[] = [];

    for (const schedule of dueSchedules) {
      try {
        await this.transactionRepository.create({
          userId: schedule.userId,
          type: schedule.type,
          mode: 'AUTO',
          recurringScheduleId: schedule.id,
          walletId: schedule.walletId,
          categoryId: schedule.categoryId ?? undefined,
          baseAmount: schedule.totalAmount,
          totalAmount: schedule.totalAmount,
          purpose: `Auto ${schedule.type}: ${schedule.title}`,
          forMember: schedule.forMember ?? undefined,
          sourceOrMerchant: schedule.title,
          notes: `Otomatis dieksekusi dari jadwal rutin tanggal ${schedule.dayOfMonth}`,
          transactionDate: new Date(),
        });

        if (schedule.type === 'INCOME') {
          await this.walletRepository.incrementBalance(
            schedule.walletId,
            schedule.totalAmount,
          );
        } else {
          await this.walletRepository.decrementBalance(
            schedule.walletId,
            schedule.totalAmount,
          );
        }

        const nextDate = this.calculateNextMonthDate(
          schedule.nextExecutionDate,
          schedule.dayOfMonth,
        );
        await this.scheduleRepository.updateNextExecutionDate(
          schedule.id,
          nextDate,
        );

        processed.push({
          scheduleId: schedule.id,
          title: schedule.title,
          type: schedule.type,
          amount: schedule.totalAmount,
          walletId: schedule.walletId,
        });

        this.logger.log(
          `Successfully processed recurring schedule: ${schedule.title} (${schedule.type})`,
        );
      } catch (err: any) {
        this.logger.error(
          `Failed to process schedule ${schedule.id}: ${err.message}`,
          err.stack,
        );
      }
    }

    return processed;
  }

  private calculateNextMonthDate(
    currentDateStr: string,
    dayOfMonth: number,
  ): string {
    const [yearStr, monthStr] = currentDateStr.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10);

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(dayOfMonth)}`;
  }
}
