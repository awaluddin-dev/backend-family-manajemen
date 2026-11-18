import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SignUpUseCase } from '../../application/use-cases/auth/signup.use-case.js';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case.js';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case.js';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case.js';
import { SignUpDto } from '../../application/dto/auth/signup.dto.js';
import { LoginDto } from '../../application/dto/auth/login.dto.js';
import { RefreshTokenDto } from '../../application/dto/auth/refresh-token.dto.js';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../infrastructure/security/token.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: SignUpDto) {
    return this.signUpUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Ip() ip: string) {
    return this.loginUseCase.execute(dto, ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: JwtPayload,
    @Body() body?: { refreshToken?: string },
  ) {
    return this.logoutUseCase.execute(user.sub, body?.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: JwtPayload) {
    return {
      id: user.sub,
      email: user.email,
    };
  }
}
