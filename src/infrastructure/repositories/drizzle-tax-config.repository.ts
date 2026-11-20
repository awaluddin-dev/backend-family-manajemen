import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { TaxConfigEntity } from '../../domain/entities/tax-config.entity.js';
import type { ITaxConfigRepository } from '../../domain/repositories/tax-config.repository.interface.js';
import type * as schema from '../database/drizzle/schema/index.js';
import { taxConfigsTable } from '../database/drizzle/schema/tax-configs.schema.js';

@Injectable()
export class DrizzleTaxConfigRepository implements ITaxConfigRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findById(id: string, userId: string): Promise<TaxConfigEntity | null> {
    const rows = await this.db
      .select()
      .from(taxConfigsTable)
      .where(
        and(eq(taxConfigsTable.id, id), eq(taxConfigsTable.userId, userId)),
      )
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return new TaxConfigEntity({
      id: r.id,
      userId: r.userId,
      name: r.name,
      ratePercent: Number(r.ratePercent),
      isDefault: r.isDefault,
      createdAt: r.createdAt,
    });
  }

  async findByUserId(userId: string): Promise<TaxConfigEntity[]> {
    const rows = await this.db
      .select()
      .from(taxConfigsTable)
      .where(eq(taxConfigsTable.userId, userId));

    return rows.map(
      (r) =>
        new TaxConfigEntity({
          id: r.id,
          userId: r.userId,
          name: r.name,
          ratePercent: Number(r.ratePercent),
          isDefault: r.isDefault,
          createdAt: r.createdAt,
        }),
    );
  }

  async findDefaultByUserId(userId: string): Promise<TaxConfigEntity | null> {
    const rows = await this.db
      .select()
      .from(taxConfigsTable)
      .where(
        and(
          eq(taxConfigsTable.userId, userId),
          eq(taxConfigsTable.isDefault, true),
        ),
      )
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return new TaxConfigEntity({
      id: r.id,
      userId: r.userId,
      name: r.name,
      ratePercent: Number(r.ratePercent),
      isDefault: r.isDefault,
      createdAt: r.createdAt,
    });
  }

  async create(config: {
    userId: string;
    name: string;
    ratePercent: number;
    isDefault?: boolean;
  }): Promise<TaxConfigEntity> {
    if (config.isDefault) {
      await this.db
        .update(taxConfigsTable)
        .set({ isDefault: false })
        .where(eq(taxConfigsTable.userId, config.userId));
    }

    const inserted = await this.db
      .insert(taxConfigsTable)
      .values({
        userId: config.userId,
        name: config.name,
        ratePercent: String(config.ratePercent),
        isDefault: Boolean(config.isDefault),
      })
      .returning();

    const r = inserted[0];
    return new TaxConfigEntity({
      id: r.id,
      userId: r.userId,
      name: r.name,
      ratePercent: Number(r.ratePercent),
      isDefault: r.isDefault,
      createdAt: r.createdAt,
    });
  }
}
