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
import { CreateWalletDto } from '../../application/dto/wallet/create-wallet.dto.js';
import { CreateWalletUseCase } from '../../application/use-cases/wallet/create-wallet.use-case.js';
import { GetWalletsUseCase } from '../../application/use-cases/wallet/get-wallets.use-case.js';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly getWalletsUseCase: GetWalletsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWalletDto) {
    return this.createWalletUseCase.execute(user.sub, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.getWalletsUseCase.execute(user.sub);
  }
}
