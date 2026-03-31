import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/commom/enums/roles.enum';
import { RolesDecorator } from 'src/roles/roles.decorator';

export const Auth = (...roles: Roles[]) =>
  applyDecorators(UseGuards(AuthGuard, RolesGuard), RolesDecorator(...roles));
