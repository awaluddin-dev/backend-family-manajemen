import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateAutoOutcomeDto {
  @IsString()
  @IsNotEmpty()
  title!: string; // e.g. "Tagihan Listrik", "Langganan Netflix"

  @IsUUID()
  @IsNotEmpty()
  walletId!: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth!: number;

  @IsString()
  @IsOptional()
  forMember?: string;
}
