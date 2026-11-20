import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessDueRecurringSchedulesUseCase } from '../../application/use-cases/cashflow/process-due-recurring-schedules.use-case.js';

@Injectable()
export class CashflowCronService {
  private readonly logger = new Logger(CashflowCronService.name);

  constructor(
    private readonly processDueSchedulesUseCase: ProcessDueRecurringSchedulesUseCase,
  ) {}

  // Run everyday at 01:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailyCashflowRecurring() {
    this.logger.log(
      '[CashflowCronService] Running daily recurring schedules processor...',
    );
    const result = await this.processDueSchedulesUseCase.execute();
    this.logger.log(
      `[CashflowCronService] Completed. Processed ${result.length} schedules.`,
    );
  }
}
