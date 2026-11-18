import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface.js';
import { TOKEN_REPOSITORY } from './domain/repositories/token.repository.interface.js';
import { CAPTCHA_SERVICE } from './domain/services/captcha.service.interface.js';
import { DrizzleUserRepository } from './infrastructure/repositories/drizzle-user.repository.js';
import { RedisTokenRepository } from './infrastructure/repositories/redis-token.repository.js';
import { HashingService } from './infrastructure/security/hashing.service.js';
import { TokenService } from './infrastructure/security/token.service.js';
import { TurnstileService } from './infrastructure/security/turnstile.service.js';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard.js';
import { SignUpUseCase } from './application/use-cases/auth/signup.use-case.js';
import { LoginUseCase } from './application/use-cases/auth/login.use-case.js';
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.use-case.js';
import { LogoutUseCase } from './application/use-cases/auth/logout.use-case.js';
import { AuthController } from './presentation/controllers/auth.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: DrizzleUserRepository,
    },
    {
      provide: TOKEN_REPOSITORY,
      useClass: RedisTokenRepository,
    },
    {
      provide: CAPTCHA_SERVICE,
      useClass: TurnstileService,
    },
    HashingService,
    TokenService,
    JwtAuthGuard,
    SignUpUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
  ],
  exports: [
    USER_REPOSITORY,
    TOKEN_REPOSITORY,
    CAPTCHA_SERVICE,
    TokenService,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
