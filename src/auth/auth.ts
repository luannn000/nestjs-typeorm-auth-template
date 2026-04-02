import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from 'src/user/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class Auth {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createAccessToken(user: User) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((role) => role.name),
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<number>(
          'JWT_ACCESS_EXPIRES_IN',
        ),
      },
    );

    return accessToken;
  }

  async createRefreshToken(user: User, res: Response) {
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<number>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      },
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRES_IN'),
    });

    return refreshToken;
  }

  async verifyToken(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
