import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../infrastructure/security/token.service.js';
import { CashflowFilterDto } from '../../application/dto/cashflow/cashflow-filter.dto.js';
import { GetCashflowTransactionsUseCase } from '../../application/use-cases/cashflow/get-cashflow-transactions.use-case.js';
import { GetCashflowSummaryUseCase } from '../../application/use-cases/cashflow/get-cashflow-summary.use-case.js';
import { ProcessDueRecurringSchedulesUseCase } from '../../application/use-cases/cashflow/process-due-recurring-schedules.use-case.js';

@Controller('cashflow')
@UseGuards(JwtAuthGuard)
export class CashflowController {
  constructor(
    private readonly getTransactionsUseCase: GetCashflowTransactionsUseCase,
    private readonly getSummaryUseCase: GetCashflowSummaryUseCase,
    private readonly processDueSchedulesUseCase: ProcessDueRecurringSchedulesUseCase,
  ) {}

  @Get('transactions')
  async getTransactions(
    @CurrentUser() user: JwtPayload,
    @Query() filter: CashflowFilterDto,
  ) {
    return this.getTransactionsUseCase.execute(user.sub, filter);
  }

  @Get('summary')
  async getSummary(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.getSummaryUseCase.execute(user.sub, startDate, endDate);
  }

  @Post('trigger-scheduler')
  @HttpCode(HttpStatus.OK)
  async triggerScheduler(@Body() body?: { targetDate?: string }) {
    return this.processDueSchedulesUseCase.execute(body?.targetDate);
  }
}
