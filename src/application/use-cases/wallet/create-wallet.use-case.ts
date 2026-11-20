import { Inject, Injectable } from '@nestjs/common';
import type { IWalletRepository } from '../../../domain/repositories/wallet.repository.interface.js';
import { WALLET_REPOSITORY } from '../../../domain/repositories/wallet.repository.interface.js';
import { CreateWalletDto } from '../../dto/wallet/create-wallet.dto.js';
import { WalletEntity } from '../../../domain/entities/wallet.entity.js';

@Injectable()
export class CreateWalletUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(userId: string, dto: CreateWalletDto): Promise<WalletEntity> {
    return this.walletRepository.create({
      userId,
      name: dto.name,
      type: dto.type,
      initialBalance: dto.initialBalance ?? 0,
      accountNumber: dto.accountNumber,
    });
  }
}
