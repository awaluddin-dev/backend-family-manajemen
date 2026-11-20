import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class RecordManualOutcomeDto {
  @IsUUID()
  @IsNotEmpty()
  walletId!: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0.01)
  baseAmount!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  taxRatePercent?: number; // e.g. 11 for 11%

  @IsNumber()
  @IsOptional()
  @Min(0)
  actualTax?: number; // real tax from receipt/bill

  @IsString()
  @IsOptional()
  @IsIn(['ONLINE', 'OFFLINE'])
  channel?: 'ONLINE' | 'OFFLINE';

  @IsString()
  @IsOptional()
  purpose?: string; // e.g. "Baju Lebaran", "Makan Siang Keluarga"

  @IsString()
  @IsOptional()
  forMember?: string; // e.g. "Anak 1", "Ibu", "Semua"

  @IsString()
  @IsOptional()
  merchant?: string; // e.g. "Tokopedia", "Shopee", "Uniqlo", "Pasar"

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  transactionDate?: string;
}
