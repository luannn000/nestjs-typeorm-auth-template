import { Body, Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { Principal } from 'src/auth/principal.decorator';
import type { PrincipalType } from 'src/auth/interfaces/principal.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  async getMe(@Principal() principal: PrincipalType) {
    return this.userService.getMe(principal);
  }

  async updateMe(
    @Principal() principal: PrincipalType,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.update(principal, body);
  }

  async deleteMe(@Principal() principal: PrincipalType) {
    return this.userService.delete(principal);
  }
}
