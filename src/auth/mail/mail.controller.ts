import { Controller, Get, Param } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return await this.mailService.verifyEmail(token);
  }
}
