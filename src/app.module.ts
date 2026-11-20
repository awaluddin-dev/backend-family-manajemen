import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DrizzleModule } from './infrastructure/database/drizzle/drizzle.module.js';
import { RedisModule } from './infrastructure/redis/redis.module.js';
import { AuthModule } from './auth.module.js';
import { CashflowModule } from './cashflow.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    DrizzleModule,
    RedisModule,
    AuthModule,
    CashflowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
