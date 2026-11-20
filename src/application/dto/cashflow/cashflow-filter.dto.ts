import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CashflowFilterDto {
  @IsOptional()
  @IsIn(['INCOME', 'OUTCOME'])
  type?: 'INCOME' | 'OUTCOME';

  @IsOptional()
  @IsIn(['MANUAL', 'AUTO'])
  mode?: 'MANUAL' | 'AUTO';

  @IsUUID()
  @IsOptional()
  walletId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsOptional()
  @IsIn(['ONLINE', 'OFFLINE'])
  channel?: 'ONLINE' | 'OFFLINE';

  @IsString()
  @IsOptional()
  forMember?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
