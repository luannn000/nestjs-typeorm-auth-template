import { Module, forwardRef } from '@nestjs/common';
import { PasswordService } from './password.service';
import { PasswordController } from './password.controller';
import { MailModule } from '../mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Password } from './password';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => MailModule)],
  controllers: [PasswordController],
  providers: [PasswordService, Password],
  exports: [PasswordService, Password],
})
export class PasswordModule {}
