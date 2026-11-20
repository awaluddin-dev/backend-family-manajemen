import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ICaptchaService } from '../../domain/services/captcha.service.interface.js';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

@Injectable()
export class TurnstileService implements ICaptchaService {
  private readonly logger = new Logger(TurnstileService.name);
  private readonly secretKey: string;
  private readonly verifyUrl =
    'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  constructor(private readonly configService: ConfigService) {
    // Default to Cloudflare's official dummy test secret key (always passes):
    // 1x0000000000000000000000000000000AA
    this.secretKey = this.configService.get<string>(
      'CLOUDFLARE_TURNSTILE_SECRET_KEY',
      '1x0000000000000000000000000000000AA',
    );
  }

  async validateToken(token: string, remoteIp?: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', this.secretKey);
      formData.append('response', token);
      if (remoteIp) {
        formData.append('remoteip', remoteIp);
      }

      const response = await fetch(this.verifyUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        this.logger.error(
          `Turnstile verification request failed with HTTP ${response.status}`,
        );
        return false;
      }

      const data = (await response.json()) as TurnstileVerifyResponse;
      if (!data.success) {
        this.logger.warn(
          `Turnstile validation failed: ${JSON.stringify(data['error-codes'])}`,
        );
      }

      return data.success;
    } catch (error: any) {
      this.logger.error(
        `Error connecting to Cloudflare Turnstile: ${error.message}`,
      );
      return false;
    }
  }
}
