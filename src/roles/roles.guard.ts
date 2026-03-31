import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrincipalType } from 'src/auth/interfaces/principal.interface';
import { Roles } from 'src/commom/enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const jwt = request.user as PrincipalType;

    const requiredRoles: Roles[] = this.reflector.get<Roles[]>(
      'roles',
      context.getHandler(),
    );

    if (requiredRoles.length < 1) {
      return true;
    }

    for (const role of jwt.roles) {
      if (requiredRoles.toString().includes(role)) {
        return true;
      }
    }

    return false;
  }
}
