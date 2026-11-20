import { Inject, Injectable } from '@nestjs/common';
import type { ITaxConfigRepository } from '../../../domain/repositories/tax-config.repository.interface.js';
import { TAX_CONFIG_REPOSITORY } from '../../../domain/repositories/tax-config.repository.interface.js';
import { PreviewTaxDto } from '../../dto/outcome/preview-tax.dto.js';

export interface TaxPreviewResult {
  baseAmount: number;
  taxRatePercent: number;
  predictedTax: number;
  estimatedTotal: number;
  configSource: 'CUSTOM' | 'DEFAULT' | 'ZERO';
}

@Injectable()
export class CalculateTaxPreviewUseCase {
  constructor(
    @Inject(TAX_CONFIG_REPOSITORY)
    private readonly taxConfigRepository: ITaxConfigRepository,
  ) {}

  async execute(userId: string, dto: PreviewTaxDto): Promise<TaxPreviewResult> {
    const baseAmount = Number(dto.baseAmount);
    let ratePercent = dto.taxRatePercent;
    let configSource: 'CUSTOM' | 'DEFAULT' | 'ZERO' = 'CUSTOM';

    if (ratePercent === undefined) {
      const defaultConfig =
        await this.taxConfigRepository.findDefaultByUserId(userId);
      if (defaultConfig) {
        ratePercent = defaultConfig.ratePercent;
        configSource = 'DEFAULT';
      } else {
        ratePercent = 0;
        configSource = 'ZERO';
      }
    }

    const predictedTax =
      Math.round(baseAmount * (ratePercent / 100) * 100) / 100;
    const estimatedTotal = baseAmount + predictedTax;

    return {
      baseAmount,
      taxRatePercent: ratePercent,
      predictedTax,
      estimatedTotal,
      configSource,
    };
  }
}
