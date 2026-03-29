import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { Roles } from 'src/commom/enums/roles.enum';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  onModuleInit() {
    const values = Object.values(Roles);

    values.forEach(async (value) => {
      const foundRole = await this.roleRepository.findOne({
        where: { name: value },
      });
      if (!foundRole) {
        const role = this.roleRepository.create({ name: value });
        await this.roleRepository.save(role);
      }
    });
  }
}
