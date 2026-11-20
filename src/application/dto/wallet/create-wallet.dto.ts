import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsIn(['BANK', 'E_WALLET', 'CASH', 'POINT'])
  type!: string;

  @IsNumber()
  @IsOptional()
  initialBalance?: number;

  @IsString()
  @IsOptional()
  accountNumber?: string;
}
