import { Inject, Injectable } from '@nestjs/common';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface.js';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/category.repository.interface.js';
import { CreateCategoryDto } from '../../dto/category/create-category.dto.js';
import { CategoryEntity } from '../../../domain/entities/category.entity.js';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoryRepository.create({
      userId,
      name: dto.name,
      type: dto.type,
      icon: dto.icon,
    });
  }
}
