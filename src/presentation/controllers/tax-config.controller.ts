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
import { CreateTaxConfigDto } from '../../application/dto/tax-config/create-tax-config.dto.js';
import { CreateTaxConfigUseCase } from '../../application/use-cases/tax-config/create-tax-config.use-case.js';
import { GetTaxConfigsUseCase } from '../../application/use-cases/tax-config/get-tax-configs.use-case.js';

@Controller('tax-configs')
@UseGuards(JwtAuthGuard)
export class TaxConfigController {
  constructor(
    private readonly createTaxConfigUseCase: CreateTaxConfigUseCase,
    private readonly getTaxConfigsUseCase: GetTaxConfigsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTaxConfigDto,
  ) {
    return this.createTaxConfigUseCase.execute(user.sub, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.getTaxConfigsUseCase.execute(user.sub);
  }
}
