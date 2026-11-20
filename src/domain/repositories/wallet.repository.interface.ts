import { WalletEntity } from '../entities/wallet.entity.js';

export const WALLET_REPOSITORY = Symbol('WALLET_REPOSITORY');

export interface IWalletRepository {
  findById(id: string, userId: string): Promise<WalletEntity | null>;
  findByUserId(userId: string): Promise<WalletEntity[]>;
  create(wallet: {
    userId: string;
    name: string;
    type: string;
    initialBalance?: number;
    accountNumber?: string;
  }): Promise<WalletEntity>;
  updateBalance(id: string, newBalance: number): Promise<void>;
  incrementBalance(id: string, amount: number): Promise<void>;
  decrementBalance(id: string, amount: number): Promise<void>;
}
