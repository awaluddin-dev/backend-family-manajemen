import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { createHash } from 'node:crypto';
import { ITokenRepository } from '../../domain/repositories/token.repository.interface.js';
import { REDIS_CLIENT } from '../redis/redis.provider.js';

@Injectable()
export class RedisTokenRepository implements ITokenRepository {
  private readonly keyPrefix = 'auth:refresh';

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getKey(userId: string, token: string): string {
    return `${this.keyPrefix}:${userId}:${this.hashToken(token)}`;
  }

  async saveRefreshToken(
    userId: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = this.getKey(userId, token);
    // Store in Redis with TTL in seconds (EX)
    await this.redis.set(
      key,
      JSON.stringify({ userId, createdAt: new Date().toISOString() }),
      'EX',
      ttlSeconds,
    );
  }

  async isRefreshTokenValid(userId: string, token: string): Promise<boolean> {
    const key = this.getKey(userId, token);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  async revokeRefreshToken(userId: string, token: string): Promise<void> {
    const key = this.getKey(userId, token);
    await this.redis.del(key);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    const pattern = `${this.keyPrefix}:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
