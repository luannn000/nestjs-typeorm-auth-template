import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async test() {
    return 'Foi';
  }

  @Get('/1')
  @UseGuards(AuthGuard('jwt'))
  async test2() {
    return 'Foi 2';
  }
}
