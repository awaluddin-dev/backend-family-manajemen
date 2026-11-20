import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../infrastructure/security/token.service.js';
import { RecordManualOutcomeDto } from '../../application/dto/outcome/record-manual-outcome.dto.js';
import { PreviewTaxDto } from '../../application/dto/outcome/preview-tax.dto.js';
import { CreateAutoOutcomeDto } from '../../application/dto/outcome/create-auto-outcome.dto.js';
import { RecordManualOutcomeUseCase } from '../../application/use-cases/outcome/record-manual-outcome.use-case.js';
import { CalculateTaxPreviewUseCase } from '../../application/use-cases/outcome/calculate-tax-preview.use-case.js';
import { CreateAutoOutcomeScheduleUseCase } from '../../application/use-cases/outcome/create-auto-outcome-schedule.use-case.js';

@Controller('cashflow/outcomes')
@UseGuards(JwtAuthGuard)
export class OutcomeController {
  constructor(
    private readonly recordManualOutcomeUseCase: RecordManualOutcomeUseCase,
    private readonly calculateTaxPreviewUseCase: CalculateTaxPreviewUseCase,
    private readonly createAutoOutcomeScheduleUseCase: CreateAutoOutcomeScheduleUseCase,
  ) {}

  @Post('preview-tax')
  @HttpCode(HttpStatus.OK)
  async previewTax(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PreviewTaxDto,
  ) {
    return this.calculateTaxPreviewUseCase.execute(user.sub, dto);
  }

  @Post('manual')
  @HttpCode(HttpStatus.CREATED)
  async recordManual(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RecordManualOutcomeDto,
  ) {
    return this.recordManualOutcomeUseCase.execute(user.sub, dto);
  }

  @Post('auto-schedule')
  @HttpCode(HttpStatus.CREATED)
  async createAutoSchedule(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAutoOutcomeDto,
  ) {
    return this.createAutoOutcomeScheduleUseCase.execute(user.sub, dto);
  }
}
