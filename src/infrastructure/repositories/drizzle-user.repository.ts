import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { UserEntity } from '../../domain/entities/user.entity.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import type * as schema from '../database/drizzle/schema/users.schema.js';
import { usersTable } from '../database/drizzle/schema/users.schema.js';

@Injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const results = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return new UserEntity({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const results = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return new UserEntity({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(user: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserEntity> {
    const inserted = await this.db
      .insert(usersTable)
      .values({
        name: user.name,
        email: user.email.toLowerCase(),
        password: user.password,
      })
      .returning();

    const row = inserted[0];
    return new UserEntity({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
