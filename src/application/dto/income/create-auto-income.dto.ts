import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class RecurringBreakdownItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string; // e.g. "Gaji Pokok", "Tunjangan", "Potongan PPh 21"

  @IsString()
  @IsIn(['ALLOWANCE', 'DEDUCTION'])
  itemType!: 'ALLOWANCE' | 'DEDUCTION';

  @IsNumber()
  @Min(0)
  amount!: number;
}

export class CreateAutoIncomeDto {
  @IsString()
  @IsNotEmpty()
  title!: string; // e.g. "Gaji Bulanan Kantor"

  @IsUUID()
  @IsNotEmpty()
  walletId!: string; // target wallet/account to receive salary

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth!: number; // e.g. 25

  @IsString()
  @IsOptional()
  forMember?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecurringBreakdownItemDto)
  items!: RecurringBreakdownItemDto[]; // breakdown list (gaji pokok, tunjangan, pajak, etc)
}
