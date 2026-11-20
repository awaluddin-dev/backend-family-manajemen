import { CategoryEntity } from '../entities/category.entity.js';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface ICategoryRepository {
  findById(id: string, userId: string): Promise<CategoryEntity | null>;
  findByUserId(userId: string, type?: string): Promise<CategoryEntity[]>;
  create(category: {
    userId: string;
    name: string;
    type: string;
    icon?: string;
  }): Promise<CategoryEntity>;
}
