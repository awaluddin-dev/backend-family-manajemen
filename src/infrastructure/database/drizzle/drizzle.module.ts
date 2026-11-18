import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleModule as NestDrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/users.schema.js';
import { DatabaseBootstrapService } from './database-bootstrap.service.js';

@Global()
@Module({
  imports: [
    NestDrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        drizzle,
        connection: configService.get<string>(
          'DATABASE_URL',
          'postgres://admin:password123@localhost:5432/my_database',
        ),
        config: { schema },
      }),
    }),
  ],
  providers: [DatabaseBootstrapService],
  exports: [NestDrizzleModule, DatabaseBootstrapService],
})
export class DrizzleModule {}
