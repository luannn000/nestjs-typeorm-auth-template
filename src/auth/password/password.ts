import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class Password {
  hashPassword(password: string) {
    const hashedPassword = argon2.hash(password);
    return hashedPassword;
  }

  async verifyPassword(hashedPassword: string, plainPassword: string) {
    return await argon2.verify(hashedPassword, plainPassword);
  }
}
