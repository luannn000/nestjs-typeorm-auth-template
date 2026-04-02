import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  async login(@Res() res: Response, @Body() body: LoginDto) {
    const data = await this.authService.login(res, body);
    return res.json(data);
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const data = await this.authService.refresh(req, res);
    return res.json(data);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const data = await this.authService.logout(req, res);
    return res.json(data);
  }
}
