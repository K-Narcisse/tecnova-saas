import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Si l'utilisateur n'est pas connecté ou n'a pas le bon rôle
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Vous n'avez pas les droits nécessaires pour cette action.");
    }

    return true;
  }
}