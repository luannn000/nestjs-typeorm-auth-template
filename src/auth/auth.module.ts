import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailModule } from './email/email.module';
import { PasswordModule } from './password/password.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { EncryptionModule } from 'src/encryption/encryption.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    EncryptionModule,
    EmailModule,
    PasswordModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
