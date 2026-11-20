import {
  RecurringScheduleEntity,
  RecurringBreakdownItemProps,
} from '../entities/recurring-schedule.entity.js';

export const RECURRING_SCHEDULE_REPOSITORY = Symbol(
  'RECURRING_SCHEDULE_REPOSITORY',
);

export interface IRecurringScheduleRepository {
  findById(id: string, userId: string): Promise<RecurringScheduleEntity | null>;
  findByUserId(
    userId: string,
    type?: 'INCOME' | 'OUTCOME',
  ): Promise<RecurringScheduleEntity[]>;
  findDueSchedules(dateStr: string): Promise<RecurringScheduleEntity[]>;
  create(data: {
    userId: string;
    title: string;
    type: 'INCOME' | 'OUTCOME';
    walletId: string;
    categoryId?: string;
    frequency?: string;
    dayOfMonth: number;
    totalAmount: number;
    nextExecutionDate: string;
    forMember?: string;
    items?: RecurringBreakdownItemProps[];
  }): Promise<RecurringScheduleEntity>;
  updateNextExecutionDate(id: string, nextExecutionDate: string): Promise<void>;
}
