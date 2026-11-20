import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { CategoryEntity } from '../../domain/entities/category.entity.js';
import type { ICategoryRepository } from '../../domain/repositories/category.repository.interface.js';
import type * as schema from '../database/drizzle/schema/index.js';
import { categoriesTable } from '../database/drizzle/schema/categories.schema.js';

@Injectable()
export class DrizzleCategoryRepository implements ICategoryRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findById(id: string, userId: string): Promise<CategoryEntity | null> {
    const rows = await this.db
      .select()
      .from(categoriesTable)
      .where(
        and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)),
      )
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return new CategoryEntity({
      id: r.id,
      userId: r.userId,
      name: r.name,
      type: r.type,
      icon: r.icon,
      createdAt: r.createdAt,
    });
  }

  async findByUserId(userId: string, type?: string): Promise<CategoryEntity[]> {
    const conditions = [eq(categoriesTable.userId, userId)];
    if (type) {
      conditions.push(eq(categoriesTable.type, type));
    }

    const rows = await this.db
      .select()
      .from(categoriesTable)
      .where(and(...conditions));

    return rows.map(
      (r) =>
        new CategoryEntity({
          id: r.id,
          userId: r.userId,
          name: r.name,
          type: r.type,
          icon: r.icon,
          createdAt: r.createdAt,
        }),
    );
  }

  async create(category: {
    userId: string;
    name: string;
    type: string;
    icon?: string;
  }): Promise<CategoryEntity> {
    const inserted = await this.db
      .insert(categoriesTable)
      .values({
        userId: category.userId,
        name: category.name,
        type: category.type,
        icon: category.icon ?? null,
      })
      .returning();

    const r = inserted[0];
    return new CategoryEntity({
      id: r.id,
      userId: r.userId,
      name: r.name,
      type: r.type,
      icon: r.icon,
      createdAt: r.createdAt,
    });
  }
}
