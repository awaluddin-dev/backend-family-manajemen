import { Inject, Injectable } from '@nestjs/common';
import type { ITokenRepository } from '../../../domain/repositories/token.repository.interface.js';
import { TOKEN_REPOSITORY } from '../../../domain/repositories/token.repository.interface.js';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
  ) {}

  async execute(
    userId: string,
    refreshToken?: string,
  ): Promise<{ message: string }> {
    if (refreshToken) {
      await this.tokenRepository.revokeRefreshToken(userId, refreshToken);
    } else {
      await this.tokenRepository.revokeAllUserTokens(userId);
    }
    return { message: 'Logged out successfully' };
  }
}
