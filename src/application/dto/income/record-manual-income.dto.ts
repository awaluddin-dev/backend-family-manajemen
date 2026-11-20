import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class RecordManualIncomeDto {
  @IsUUID()
  @IsNotEmpty()
  walletId!: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0.01)
  amount!: string | number;

  @IsString()
  @IsOptional()
  source?: string; // e.g. "Claim Poin Harian", "Freelance Project", "Hadiah"

  @IsString()
  @IsOptional()
  forMember?: string; // e.g. "Ayah", "Ibu", "Anak 1"

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  transactionDate?: string;
}
