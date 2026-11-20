import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsIn(['INCOME', 'OUTCOME'])
  type!: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
