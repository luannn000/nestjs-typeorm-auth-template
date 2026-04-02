import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class Password {
  constructor(private readonly config: ConfigService) {}

  hashPassword(password: string) {
    const salt = this.config.getOrThrow<string>('ARGON_SALT');
    const hashedPassword = argon2.hash(password, { salt: Buffer.from(salt) });

    return hashedPassword;
  }

  async verifyPassword(hashedPassword: string, plainPassword: string) {
    return await argon2.verify(hashedPassword, plainPassword);
  }
}
