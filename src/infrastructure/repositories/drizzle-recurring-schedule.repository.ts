import { Injectable } from '@nestjs/common';
import { eq, and, lte } from 'drizzle-orm';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  RecurringScheduleEntity,
  RecurringBreakdownItemEntity,
  RecurringBreakdownItemProps,
} from '../../domain/entities/recurring-schedule.entity.js';
import type { IRecurringScheduleRepository } from '../../domain/repositories/recurring-schedule.repository.interface.js';
import type * as schema from '../database/drizzle/schema/index.js';
import {
  recurringSchedulesTable,
  recurringBreakdownItemsTable,
} from '../database/drizzle/schema/recurring-schedules.schema.js';

@Injectable()
export class DrizzleRecurringScheduleRepository implements IRecurringScheduleRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  private async loadBreakdownItems(
    scheduleId: string,
  ): Promise<RecurringBreakdownItemEntity[]> {
    const items = await this.db
      .select()
      .from(recurringBreakdownItemsTable)
      .where(eq(recurringBreakdownItemsTable.scheduleId, scheduleId));

    return items.map(
      (item) =>
        new RecurringBreakdownItemEntity({
          id: item.id,
          scheduleId: item.scheduleId,
          name: item.name,
          itemType: item.itemType as 'ALLOWANCE' | 'DEDUCTION',
          amount: Number(item.amount),
        }),
    );
  }

  async findById(
    id: string,
    userId: string,
  ): Promise<RecurringScheduleEntity | null> {
    const rows = await this.db
      .select()
      .from(recurringSchedulesTable)
      .where(
        and(
          eq(recurringSchedulesTable.id, id),
          eq(recurringSchedulesTable.userId, userId),
        ),
      )
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    const items = await this.loadBreakdownItems(r.id);

    return new RecurringScheduleEntity({
      id: r.id,
      userId: r.userId,
      title: r.title,
      type: r.type as 'INCOME' | 'OUTCOME',
      walletId: r.walletId,
      categoryId: r.categoryId,
      frequency: r.frequency,
      dayOfMonth: r.dayOfMonth,
      totalAmount: Number(r.totalAmount),
      nextExecutionDate: r.nextExecutionDate,
      isActive: r.isActive,
      forMember: r.forMember,
      items,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  async findByUserId(
    userId: string,
    type?: 'INCOME' | 'OUTCOME',
  ): Promise<RecurringScheduleEntity[]> {
    const conditions = [eq(recurringSchedulesTable.userId, userId)];
    if (type) {
      conditions.push(eq(recurringSchedulesTable.type, type));
    }

    const rows = await this.db
      .select()
      .from(recurringSchedulesTable)
      .where(and(...conditions));

    const results: RecurringScheduleEntity[] = [];
    for (const r of rows) {
      const items = await this.loadBreakdownItems(r.id);
      results.push(
        new RecurringScheduleEntity({
          id: r.id,
          userId: r.userId,
          title: r.title,
          type: r.type as 'INCOME' | 'OUTCOME',
          walletId: r.walletId,
          categoryId: r.categoryId,
          frequency: r.frequency,
          dayOfMonth: r.dayOfMonth,
          totalAmount: Number(r.totalAmount),
          nextExecutionDate: r.nextExecutionDate,
          isActive: r.isActive,
          forMember: r.forMember,
          items,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }),
      );
    }
    return results;
  }

  async findDueSchedules(dateStr: string): Promise<RecurringScheduleEntity[]> {
    const rows = await this.db
      .select()
      .from(recurringSchedulesTable)
      .where(
        and(
          eq(recurringSchedulesTable.isActive, true),
          lte(recurringSchedulesTable.nextExecutionDate, dateStr),
        ),
      );

    const results: RecurringScheduleEntity[] = [];
    for (const r of rows) {
      const items = await this.loadBreakdownItems(r.id);
      results.push(
        new RecurringScheduleEntity({
          id: r.id,
          userId: r.userId,
          title: r.title,
          type: r.type as 'INCOME' | 'OUTCOME',
          walletId: r.walletId,
          categoryId: r.categoryId,
          frequency: r.frequency,
          dayOfMonth: r.dayOfMonth,
          totalAmount: Number(r.totalAmount),
          nextExecutionDate: r.nextExecutionDate,
          isActive: r.isActive,
          forMember: r.forMember,
          items,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }),
      );
    }
    return results;
  }

  async create(data: {
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
  }): Promise<RecurringScheduleEntity> {
    return await this.db.transaction(async (tx) => {
      const inserted = await tx
        .insert(recurringSchedulesTable)
        .values({
          userId: data.userId,
          title: data.title,
          type: data.type,
          walletId: data.walletId,
          categoryId: data.categoryId ?? null,
          frequency: data.frequency ?? 'MONTHLY',
          dayOfMonth: data.dayOfMonth,
          totalAmount: String(data.totalAmount),
          nextExecutionDate: data.nextExecutionDate,
          forMember: data.forMember ?? null,
        })
        .returning();

      const schedule = inserted[0];
      const items: RecurringBreakdownItemEntity[] = [];

      if (data.items && data.items.length > 0) {
        for (const it of data.items) {
          const insertedItem = await tx
            .insert(recurringBreakdownItemsTable)
            .values({
              scheduleId: schedule.id,
              name: it.name,
              itemType: it.itemType,
              amount: String(it.amount),
            })
            .returning();
          const savedItem = insertedItem[0];
          items.push(
            new RecurringBreakdownItemEntity({
              id: savedItem.id,
              scheduleId: savedItem.scheduleId,
              name: savedItem.name,
              itemType: savedItem.itemType as 'ALLOWANCE' | 'DEDUCTION',
              amount: Number(savedItem.amount),
            }),
          );
        }
      }

      return new RecurringScheduleEntity({
        id: schedule.id,
        userId: schedule.userId,
        title: schedule.title,
        type: schedule.type as 'INCOME' | 'OUTCOME',
        walletId: schedule.walletId,
        categoryId: schedule.categoryId,
        frequency: schedule.frequency,
        dayOfMonth: schedule.dayOfMonth,
        totalAmount: Number(schedule.totalAmount),
        nextExecutionDate: schedule.nextExecutionDate,
        isActive: schedule.isActive,
        forMember: schedule.forMember,
        items,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt,
      });
    });
  }

  async updateNextExecutionDate(
    id: string,
    nextExecutionDate: string,
  ): Promise<void> {
    await this.db
      .update(recurringSchedulesTable)
      .set({ nextExecutionDate, updatedAt: new Date() })
      .where(eq(recurringSchedulesTable.id, id));
  }
}
