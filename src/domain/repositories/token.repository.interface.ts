export const TOKEN_REPOSITORY = Symbol('TOKEN_REPOSITORY');

export interface ITokenRepository {
  /**
   * Save refresh token to Redis with TTL
   * @param userId user identifier
   * @param token refresh token string
   * @param ttlSeconds time-to-live in seconds (7 days = 604800s)
   */
  saveRefreshToken(
    userId: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void>;

  /**
   * Check if refresh token exists in Redis
   */
  isRefreshTokenValid(userId: string, token: string): Promise<boolean>;

  /**
   * Remove a specific refresh token from Redis
   */
  revokeRefreshToken(userId: string, token: string): Promise<void>;

  /**
   * Revoke all refresh tokens for a given user
   */
  revokeAllUserTokens(userId: string): Promise<void>;
}
