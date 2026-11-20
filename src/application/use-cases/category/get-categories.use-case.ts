import { Inject, Injectable } from '@nestjs/common';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface.js';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/category.repository.interface.js';
import { CategoryEntity } from '../../../domain/entities/category.entity.js';

@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(userId: string, type?: string): Promise<CategoryEntity[]> {
    return this.categoryRepository.findByUserId(userId, type);
  }
}
