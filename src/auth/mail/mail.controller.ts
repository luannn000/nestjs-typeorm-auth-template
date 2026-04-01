import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('auth/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body('email') email: string) {
    return await this.mailService.resendVerificationEmail(email);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return await this.mailService.verifyEmail(token);
  }
}
