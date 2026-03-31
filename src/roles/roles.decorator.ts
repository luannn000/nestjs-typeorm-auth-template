import { SetMetadata } from '@nestjs/common';
import { Roles } from 'src/commom/enums/roles.enum';

export const RolesDecorator = (...args: Roles[]) => SetMetadata('roles', args);
