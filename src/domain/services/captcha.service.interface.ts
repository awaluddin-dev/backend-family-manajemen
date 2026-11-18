export const CAPTCHA_SERVICE = Symbol('CAPTCHA_SERVICE');

export interface ICaptchaService {
  validateToken(token: string, remoteIp?: string): Promise<boolean>;
}
