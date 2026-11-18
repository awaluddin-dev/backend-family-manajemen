import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignUpUseCase } from './signup.use-case.js';
import { LoginUseCase } from './login.use-case.js';
import { RefreshTokenUseCase } from './refresh-token.use-case.js';
import { LogoutUseCase } from './logout.use-case.js';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../../../domain/entities/user.entity.js';

describe('Auth Use Cases', () => {
  let mockUserRepository: any;
  let mockTokenRepository: any;
  let mockHashingService: any;
  let mockTokenService: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    mockTokenRepository = {
      saveRefreshToken: vi.fn(),
      isRefreshTokenValid: vi.fn(),
      revokeRefreshToken: vi.fn(),
      revokeAllUserTokens: vi.fn(),
    };

    mockHashingService = {
      hashPassword: vi.fn().mockResolvedValue('hashed_password'),
      comparePassword: vi.fn(),
    };

    mockTokenService = {
      refreshTtlSeconds: 604800, // 7 days
      generateTokens: vi.fn().mockResolvedValue({
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresIn: 900,
        refreshExpiresIn: 604800,
      }),
      verifyRefreshToken: vi.fn(),
    };
  });

  describe('SignUpUseCase', () => {
    it('should successfully sign up a new user and store refresh token in Redis', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(
        new UserEntity({
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashed_password',
        }),
      );

      const useCase = new SignUpUseCase(
        mockUserRepository,
        mockTokenRepository,
        mockHashingService,
        mockTokenService,
      );

      const result = await useCase.execute({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(mockHashingService.hashPassword).toHaveBeenCalledWith(
        'password123',
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
      });
      expect(mockTokenRepository.saveRefreshToken).toHaveBeenCalledWith(
        'user-123',
        'mock_refresh_token',
        604800,
      );
      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
      expect(result.refreshExpiresIn).toBe(604800);
      expect(result.user.email).toBe('john@example.com');
    });

    it('should throw ConflictException if email is already taken', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        new UserEntity({
          id: 'existing-id',
          name: 'Existing',
          email: 'john@example.com',
        }),
      );

      const useCase = new SignUpUseCase(
        mockUserRepository,
        mockTokenRepository,
        mockHashingService,
        mockTokenService,
      );

      await expect(
        useCase.execute({
          name: 'John',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('LoginUseCase', () => {
    it('should successfully log in and save refresh token with 7 days TTL', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        new UserEntity({
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashed_password',
        }),
      );
      mockHashingService.comparePassword.mockResolvedValue(true);

      const useCase = new LoginUseCase(
        mockUserRepository,
        mockTokenRepository,
        mockHashingService,
        mockTokenService,
      );

      const result = await useCase.execute({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(mockHashingService.comparePassword).toHaveBeenCalledWith(
        'password123',
        'hashed_password',
      );
      expect(mockTokenRepository.saveRefreshToken).toHaveBeenCalledWith(
        'user-123',
        'mock_refresh_token',
        604800,
      );
      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
      expect(result.refreshExpiresIn).toBe(604800);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        new UserEntity({
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashed_password',
        }),
      );
      mockHashingService.comparePassword.mockResolvedValue(false);

      const useCase = new LoginUseCase(
        mockUserRepository,
        mockTokenRepository,
        mockHashingService,
        mockTokenService,
      );

      await expect(
        useCase.execute({ email: 'john@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('RefreshTokenUseCase', () => {
    it('should validate token in Redis, rotate tokens, and update Redis with 7 days TTL', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        sub: 'user-123',
        email: 'john@example.com',
      });
      mockTokenRepository.isRefreshTokenValid.mockResolvedValue(true);
      mockUserRepository.findById.mockResolvedValue(
        new UserEntity({
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
        }),
      );

      const useCase = new RefreshTokenUseCase(
        mockUserRepository,
        mockTokenRepository,
        mockTokenService,
      );

      const result = await useCase.execute({
        refreshToken: 'valid_refresh_token',
      });

      expect(mockTokenRepository.revokeRefreshToken).toHaveBeenCalledWith(
        'user-123',
        'valid_refresh_token',
      );
      expect(mockTokenRepository.saveRefreshToken).toHaveBeenCalledWith(
        'user-123',
        'mock_refresh_token',
        604800,
      );
      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
    });

    it('should throw UnauthorizedException if refresh token is not found in Redis', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue({
        sub: 'user-123',
        email: 'john@example.com',
      });
      mockTokenRepository.isRefreshTokenValid.mockResolvedValue(false);

      const useCase = new RefreshTokenUseCase(
        mockUserRepository,
        mockTokenRepository,
        mockTokenService,
      );

      await expect(
        useCase.execute({ refreshToken: 'revoked_or_expired_token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('LogoutUseCase', () => {
    it('should revoke token in Redis', async () => {
      const useCase = new LogoutUseCase(mockTokenRepository);
      const res = await useCase.execute('user-123', 'token-to-revoke');

      expect(mockTokenRepository.revokeRefreshToken).toHaveBeenCalledWith(
        'user-123',
        'token-to-revoke',
      );
      expect(res.message).toBe('Logged out successfully');
    });
  });
});
