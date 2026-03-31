import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordModule } from './password/password.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { MailModule } from './mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { Auth } from './auth';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([User, Role]),
    MailModule,
    PasswordModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, Auth, JwtStrategy],
})
export class AuthModule {}
