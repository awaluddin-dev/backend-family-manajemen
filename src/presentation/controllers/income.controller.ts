import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../infrastructure/security/token.service.js';
import { RecordManualIncomeDto } from '../../application/dto/income/record-manual-income.dto.js';
import { CreateAutoIncomeDto } from '../../application/dto/income/create-auto-income.dto.js';
import { RecordManualIncomeUseCase } from '../../application/use-cases/income/record-manual-income.use-case.js';
import { CreateAutoIncomeScheduleUseCase } from '../../application/use-cases/income/create-auto-income-schedule.use-case.js';
import { SimulateAnnualIncomeUseCase } from '../../application/use-cases/income/simulate-annual-income.use-case.js';

@Controller('cashflow/incomes')
@UseGuards(JwtAuthGuard)
export class IncomeController {
  constructor(
    private readonly recordManualIncomeUseCase: RecordManualIncomeUseCase,
    private readonly createAutoIncomeScheduleUseCase: CreateAutoIncomeScheduleUseCase,
    private readonly simulateAnnualIncomeUseCase: SimulateAnnualIncomeUseCase,
  ) {}

  @Post('manual')
  @HttpCode(HttpStatus.CREATED)
  async recordManual(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RecordManualIncomeDto,
  ) {
    return this.recordManualIncomeUseCase.execute(user.sub, dto);
  }

  @Post('auto-schedule')
  @HttpCode(HttpStatus.CREATED)
  async createAutoSchedule(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAutoIncomeDto,
  ) {
    return this.createAutoIncomeScheduleUseCase.execute(user.sub, dto);
  }

  @Get('simulation/annual')
  async simulateAnnual(@CurrentUser() user: JwtPayload) {
    return this.simulateAnnualIncomeUseCase.execute(user.sub);
  }
}
