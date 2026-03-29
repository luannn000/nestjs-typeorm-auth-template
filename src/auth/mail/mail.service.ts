import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
  ) {}

  async sendVerificationEmail(to: string, token: string) {
    const verificationLink = join(
      this.config.getOrThrow<string>('FRONTEND_URL'),
      'verify-email',
      token,
    );
    await this.mailer.sendMail({
      to,
      subject: 'Email Verification',
      template: './email-verify.page',
      context: {
        verifyUrl: verificationLink,
      },
    });
  }
}
