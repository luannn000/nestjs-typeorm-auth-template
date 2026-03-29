import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login() {
    // Implementation for login
  }

  @Post('register')
  async register() {
    // Implementation for registration
  }

  @Post('refresh')
  async refresh() {
    // Implementation for token refresh
  }

  @Post('logout')
  async logout() {
    // Implementation for logout
  }
}
