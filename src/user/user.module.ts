import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Password } from 'src/auth/password/password';

@Module({
  imports: [Password],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
