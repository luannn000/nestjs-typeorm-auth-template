import * as argon2 from 'argon2';
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
}
