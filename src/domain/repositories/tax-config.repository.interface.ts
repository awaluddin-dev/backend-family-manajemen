import { TaxConfigEntity } from '../entities/tax-config.entity.js';

export const TAX_CONFIG_REPOSITORY = Symbol('TAX_CONFIG_REPOSITORY');

export interface ITaxConfigRepository {
  findById(id: string, userId: string): Promise<TaxConfigEntity | null>;
  findByUserId(userId: string): Promise<TaxConfigEntity[]>;
  findDefaultByUserId(userId: string): Promise<TaxConfigEntity | null>;
  create(config: {
    userId: string;
    name: string;
    ratePercent: number;
    isDefault?: boolean;
  }): Promise<TaxConfigEntity>;
}
