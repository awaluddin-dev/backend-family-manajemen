import { Inject, Injectable } from '@nestjs/common';
import type { ITaxConfigRepository } from '../../../domain/repositories/tax-config.repository.interface.js';
import { TAX_CONFIG_REPOSITORY } from '../../../domain/repositories/tax-config.repository.interface.js';
import { TaxConfigEntity } from '../../../domain/entities/tax-config.entity.js';

@Injectable()
export class GetTaxConfigsUseCase {
  constructor(
    @Inject(TAX_CONFIG_REPOSITORY)
    private readonly taxConfigRepository: ITaxConfigRepository,
  ) {}

  async execute(userId: string): Promise<TaxConfigEntity[]> {
    return this.taxConfigRepository.findByUserId(userId);
  }
}
