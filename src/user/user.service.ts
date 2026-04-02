import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PrincipalType } from 'src/auth/interfaces/principal.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { Password } from 'src/auth/password/password';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly password: Password,
  ) {}

  async getMe(principal: PrincipalType) {
    const user = await this.usersRepository.findOne({
      where: { email: principal.email },
    });

    if (!user || !user.isActive) throw new NotFoundException('User not found');

    return user;
  }

  async update(principal: PrincipalType, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { email: principal.email },
    });

    if (!user || !user.isActive) throw new NotFoundException('User not found');

    if (dto.username !== undefined) user.username = dto.username;

    if (dto.password !== undefined) {
      user.password = await this.password.hashPassword(dto.password);
    }

    await this.usersRepository.save(user);

    return user;
  }

  async delete(principal: PrincipalType) {
    const user = await this.usersRepository.findOne({
      where: { email: principal.email },
    });

    if (!user) throw new NotFoundException('User not found');

    user.isActive = false;

    await this.usersRepository.save(user);

    return 'User account deactivated';
  }
}
