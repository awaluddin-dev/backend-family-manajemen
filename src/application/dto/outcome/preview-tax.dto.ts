import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class PreviewTaxDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  baseAmount!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  taxRatePercent?: number; // if omitted, uses default tax config
}
