import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface.js';
import type { ITokenRepository } from '../../../domain/repositories/token.repository.interface.js';
import { TOKEN_REPOSITORY } from '../../../domain/repositories/token.repository.interface.js';
import { HashingService } from '../../../infrastructure/security/hashing.service.js';
import { TokenService } from '../../../infrastructure/security/token.service.js';
import { SignUpDto } from '../../dto/auth/signup.dto.js';
import { AuthResponseDto } from '../../dto/auth/auth-response.dto.js';

@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: SignUpDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await this.hashingService.hashPassword(dto.password);
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    const tokens = await this.tokenService.generateTokens(user.id, user.email);

    // Store refresh token in Redis with 7 days TTL
    await this.tokenRepository.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      this.tokenService.refreshTtlSeconds,
    );

    return {
      user: user.toPublicJson(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: tokens.expiresIn,
      refreshExpiresIn: tokens.refreshExpiresIn,
    };
  }
}
