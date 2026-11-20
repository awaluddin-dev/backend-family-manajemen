import { Inject, Injectable } from '@nestjs/common';
import type { IRecurringScheduleRepository } from '../../../domain/repositories/recurring-schedule.repository.interface.js';
import { RECURRING_SCHEDULE_REPOSITORY } from '../../../domain/repositories/recurring-schedule.repository.interface.js';

export interface AnnualIncomeSimulationResult {
  monthlyNetTotal: number;
  annualNetTotal: number;
  thrEstimate: number;
  annualTotalWithThr: number;
  schedules: {
    title: string;
    dayOfMonth: number;
    monthlyNet: number;
    annualNet: number;
    allowances: { name: string; monthlyAmount: number; annualAmount: number }[];
    deductions: { name: string; monthlyAmount: number; annualAmount: number }[];
  }[];
}

@Injectable()
export class SimulateAnnualIncomeUseCase {
  constructor(
    @Inject(RECURRING_SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: IRecurringScheduleRepository,
  ) {}

  async execute(userId: string): Promise<AnnualIncomeSimulationResult> {
    const schedules = await this.scheduleRepository.findByUserId(
      userId,
      'INCOME',
    );

    let totalMonthlyNet = 0;
    let totalBaseSalaryForThr = 0;

    const detailedSchedules = schedules.map((schedule) => {
      const monthlyNet = schedule.totalAmount;
      const annualNet = monthlyNet * 12;
      totalMonthlyNet += monthlyNet;

      const allowances: {
        name: string;
        monthlyAmount: number;
        annualAmount: number;
      }[] = [];
      const deductions: {
        name: string;
        monthlyAmount: number;
        annualAmount: number;
      }[] = [];

      for (const item of schedule.items) {
        if (item.itemType === 'ALLOWANCE') {
          allowances.push({
            name: item.name,
            monthlyAmount: item.amount,
            annualAmount: item.amount * 12,
          });

          if (
            item.name.toLowerCase().includes('pokok') ||
            item.name.toLowerCase().includes('base')
          ) {
            totalBaseSalaryForThr += item.amount;
          }
        } else {
          deductions.push({
            name: item.name,
            monthlyAmount: item.amount,
            annualAmount: item.amount * 12,
          });
        }
      }

      if (totalBaseSalaryForThr === 0 && allowances.length > 0) {
        totalBaseSalaryForThr = allowances[0].monthlyAmount;
      }

      return {
        title: schedule.title,
        dayOfMonth: schedule.dayOfMonth,
        monthlyNet,
        annualNet,
        allowances,
        deductions,
      };
    });

    const annualNetTotal = totalMonthlyNet * 12;
    const thrEstimate = totalBaseSalaryForThr;
    const annualTotalWithThr = annualNetTotal + thrEstimate;

    return {
      monthlyNetTotal: totalMonthlyNet,
      annualNetTotal,
      thrEstimate,
      annualTotalWithThr,
      schedules: detailedSchedules,
    };
  }
}
