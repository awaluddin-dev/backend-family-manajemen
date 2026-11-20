import { Inject, Injectable } from '@nestjs/common';
import type { ITaxConfigRepository } from '../../../domain/repositories/tax-config.repository.interface.js';
import { TAX_CONFIG_REPOSITORY } from '../../../domain/repositories/tax-config.repository.interface.js';
import { CreateTaxConfigDto } from '../../dto/tax-config/create-tax-config.dto.js';
import { TaxConfigEntity } from '../../../domain/entities/tax-config.entity.js';

@Injectable()
export class CreateTaxConfigUseCase {
  constructor(
    @Inject(TAX_CONFIG_REPOSITORY)
    private readonly taxConfigRepository: ITaxConfigRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateTaxConfigDto,
  ): Promise<TaxConfigEntity> {
    return this.taxConfigRepository.create({
      userId,
      name: dto.name,
      ratePercent: dto.ratePercent,
      isDefault: dto.isDefault,
    });
  }
}
