import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { typeOrmModuleConfig } from './commom/config/typeorm.config';
import { configModuleConfig } from './commom/config/config.config';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleConfig),
    TypeOrmModule.forRootAsync(typeOrmModuleConfig),
    AuthModule,
    UserModule,
    RolesModule,
    EmailModule,
  ],
})
export class AppModule {}
