import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { PasswordService } from '../password/password.service';

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => PasswordService))
    private readonly passwordService: PasswordService,
    private readonly mailer: MailerService,
  ) {}

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) throw new BadRequestException('User not found');

    if (user.isEmailVerified)
      throw new BadRequestException('Email already verified');

    const { hashedToken } = this.passwordService.generateVerificationToken();
    user.verificationToken = hashedToken;
    user.emailVerificationExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await this.userRepository.save(user);

    await this.sendVerificationEmail(email, hashedToken);

    return { message: 'Verification email resent successfully' };
  }

  async sendVerificationEmail(to: string, token: string) {
    const verifyEmailUrl = this.config.getOrThrow<string>('VERIFY_EMAIL_URL');
    const verificationLink = `${verifyEmailUrl}/${token}`;
    await this.mailer.sendMail({
      to,
      subject: 'Email Verification',
      template: 'email-verify.page.hbs',
      context: {
        verifyUrl: verificationLink,
      },
    });
  }

  async verifyEmail(token: string) {
    const hashedToken = this.passwordService.hashToken(token);

    const user = await this.userRepository.findOne({
      where: { verificationToken: hashedToken },
    });
    if (!user) throw new BadRequestException('Invalid verification token');

    if (
      !user.emailVerificationExpiry ||
      user.emailVerificationExpiry < new Date()
    )
      throw new BadRequestException('Verification token has expired');

    user.isEmailVerified = true;
    user.verificationToken = null;
    user.emailVerificationExpiry = null;
    await this.userRepository.save(user);

    return { message: 'Email verification successful' };
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const resetPasswordUrl =
      this.config.getOrThrow<string>('RESET_PASSWORD_URL');
    const resetLink = `${resetPasswordUrl}/${token}`;
    await this.mailer.sendMail({
      to,
      subject: 'Password Reset',
      template: 'password-reset.page.hbs',
      context: {
        resetLink,
      },
    });
  }
}
