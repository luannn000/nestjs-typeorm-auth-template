import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  constructor(private readonly config: ConfigService) {}

  hashPassword(password: string) {
    const salt = this.config.getOrThrow<string>('ARGON_SALT');
    const hashedPassword = argon2.hash(password, { salt: Buffer.from(salt) });

    return hashedPassword;
  }

  generateVerificationToken() {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    return { rawToken, hashedToken };
  }

  hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
