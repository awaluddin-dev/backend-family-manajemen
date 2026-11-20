import { Inject, Injectable } from '@nestjs/common';
import type { IWalletRepository } from '../../../domain/repositories/wallet.repository.interface.js';
import { WALLET_REPOSITORY } from '../../../domain/repositories/wallet.repository.interface.js';
import { WalletEntity } from '../../../domain/entities/wallet.entity.js';

@Injectable()
export class GetWalletsUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(userId: string): Promise<WalletEntity[]> {
    return this.walletRepository.findByUserId(userId);
  }
}
