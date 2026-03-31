import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email not found');

    const { hashedToken } = this.generateVerificationToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await this.userRepository.save(user);

    await this.mailService.sendResetPasswordEmail(email, hashedToken);

    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');

    if (user.passwordResetExpiry && user.passwordResetExpiry < new Date())
      throw new BadRequestException('Password reset token has expired');

    user.password = await this.hashPassword(newPassword);
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;

    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  hashPassword(password: string) {
    const salt = this.config.getOrThrow<string>('ARGON_SALT');
    const hashedPassword = argon2.hash(password, { salt: Buffer.from(salt) });

    return hashedPassword;
  }

  async verifyPassword(hashedPassword: string, plainPassword: string) {
    return await argon2.verify(hashedPassword, plainPassword);
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
