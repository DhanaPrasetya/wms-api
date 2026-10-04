// src/common/decorators/auth.decorator.ts
import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/infrastructure/passport/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorators';
import { UserThrottlerGuard } from '../guards/user-throttler.guard';

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: string;
  jti: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}

export const CurrentUser: ReturnType<typeof createParamDecorator> =
  createParamDecorator((data: unknown, context: ExecutionContext) => {
    const request: AuthenticatedRequest = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    const property: keyof AuthenticatedUser | undefined =
      typeof data === 'string' ? (data as keyof AuthenticatedUser) : undefined;

    return property ? request.user?.[property] : request.user;
  });

export function Auth(...roles: string[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, RolesGuard, UserThrottlerGuard),
  );
}
