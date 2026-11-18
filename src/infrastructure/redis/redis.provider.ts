import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const host = configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = configService.get<number>('REDIS_PORT', 6379);

    const client = new Redis({
      host,
      port: Number(port),
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });

    client.on('error', (err) => {
      console.error('[Redis Client Error]', err.message);
    });

    return client;
  },
};
