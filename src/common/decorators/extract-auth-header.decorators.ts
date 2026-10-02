import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const ExtractAuthHeader: ReturnType<typeof createParamDecorator> =
  createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest<Request>();
    const authorization: string | undefined = request.headers['authorization'];

    if (!authorization) {
      throw new BadRequestException('Authorization header required');
    }

    const parts: string[] = authorization.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'basic') {
      throw new BadRequestException('Basic authorization required');
    }

    // Decode Base64 credentials (email:password)
    const credentials: string = Buffer.from(parts[1], 'base64').toString(
      'utf8',
    );
    const separatorIndex: number = credentials.indexOf(':');

    if (separatorIndex <= 0) {
      throw new BadRequestException(
        'Authorization header must contain email and password',
      );
    }

    const email: string = credentials.slice(0, separatorIndex).trim();
    const password: string = credentials.slice(separatorIndex + 1);

    if (!email || !password) {
      throw new BadRequestException(
        'Email and password required in authorization header',
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 345) {
      throw new BadRequestException(
        'Valid email address required in authorization header',
      );
    }

    if (password.length > 255) {
      throw new BadRequestException('Password must not exceed 255 characters');
    }

    // Return object shape matching LoginDto properties
    return { email, password };
  });
