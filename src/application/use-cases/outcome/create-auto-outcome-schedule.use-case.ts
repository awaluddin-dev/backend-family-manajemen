import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IWalletRepository } from '../../../domain/repositories/wallet.repository.interface.js';
import { WALLET_REPOSITORY } from '../../../domain/repositories/wallet.repository.interface.js';
import type { IRecurringScheduleRepository } from '../../../domain/repositories/recurring-schedule.repository.interface.js';
import { RECURRING_SCHEDULE_REPOSITORY } from '../../../domain/repositories/recurring-schedule.repository.interface.js';
import { CreateAutoOutcomeDto } from '../../dto/outcome/create-auto-outcome.dto.js';
import { RecurringScheduleEntity } from '../../../domain/entities/recurring-schedule.entity.js';

@Injectable()
export class CreateAutoOutcomeScheduleUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(RECURRING_SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: IRecurringScheduleRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateAutoOutcomeDto,
  ): Promise<RecurringScheduleEntity> {
    const wallet = await this.walletRepository.findById(dto.walletId, userId);
    if (!wallet) {
      throw new NotFoundException('Source wallet not found');
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
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
      type: 'OUTCOME',
      walletId: dto.walletId,
      categoryId: dto.categoryId,
      frequency: 'MONTHLY',
      dayOfMonth: dto.dayOfMonth,
      totalAmount: Number(dto.amount),
      nextExecutionDate,
      forMember: dto.forMember,
    });
  }
}
