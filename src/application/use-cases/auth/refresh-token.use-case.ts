import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface.js';
import type { ITokenRepository } from '../../../domain/repositories/token.repository.interface.js';
import { TOKEN_REPOSITORY } from '../../../domain/repositories/token.repository.interface.js';
import { TokenService } from '../../../infrastructure/security/token.service.js';
import { RefreshTokenDto } from '../../dto/auth/refresh-token.dto.js';
import { AuthResponseDto } from '../../dto/auth/auth-response.dto.js';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const payload = await this.tokenService.verifyRefreshToken(
      dto.refreshToken,
    );

    const isValidInRedis = await this.tokenRepository.isRefreshTokenValid(
      payload.sub,
      dto.refreshToken,
    );

    if (!isValidInRedis) {
      throw new UnauthorizedException(
        'Refresh token is invalid, expired or revoked',
      );
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke old refresh token (token rotation)
    await this.tokenRepository.revokeRefreshToken(
      payload.sub,
      dto.refreshToken,
    );

    // Generate new token pair
    const tokens = await this.tokenService.generateTokens(user.id, user.email);

    // Store new refresh token in Redis with 7 days TTL
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
