import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EncryptionService } from 'src/encryption/encryption.service';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly mailer: MailerService,
  ) {}

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
    const hashedToken = this.encryptionService.hashToken(token);

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
}
