import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IWalletRepository } from '../../../domain/repositories/wallet.repository.interface.js';
import { WALLET_REPOSITORY } from '../../../domain/repositories/wallet.repository.interface.js';
import type { IRecurringScheduleRepository } from '../../../domain/repositories/recurring-schedule.repository.interface.js';
import { RECURRING_SCHEDULE_REPOSITORY } from '../../../domain/repositories/recurring-schedule.repository.interface.js';
import { CreateAutoIncomeDto } from '../../dto/income/create-auto-income.dto.js';
import { RecurringScheduleEntity } from '../../../domain/entities/recurring-schedule.entity.js';

@Injectable()
export class CreateAutoIncomeScheduleUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(RECURRING_SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: IRecurringScheduleRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateAutoIncomeDto,
  ): Promise<RecurringScheduleEntity> {
    const wallet = await this.walletRepository.findById(dto.walletId, userId);
    if (!wallet) {
      throw new NotFoundException('Target wallet not found');
    }

    let totalAllowance = 0;
    let totalDeduction = 0;

    for (const item of dto.items) {
      if (item.itemType === 'ALLOWANCE') {
        totalAllowance += Number(item.amount);
      } else {
        totalDeduction += Number(item.amount);
      }
    }

    const netAmount = Math.max(0, totalAllowance - totalDeduction);

    // Calculate next execution date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const todayDate = now.getDate();

    let targetYear = currentYear;
    let targetMonth = currentMonth;

    if (todayDate > dto.dayOfMonth) {
      targetMonth += 1;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const nextExecutionDate = `${targetYear}-${pad(targetMonth + 1)}-${pad(dto.dayOfMonth)}`;

    return this.scheduleRepository.create({
      userId,
      title: dto.title,
      type: 'INCOME',
      walletId: dto.walletId,
      categoryId: dto.categoryId,
      frequency: 'MONTHLY',
      dayOfMonth: dto.dayOfMonth,
      totalAmount: netAmount,
      nextExecutionDate,
      forMember: dto.forMember,
      items: dto.items,
    });
  }
}
