// src/common/guards/user-throttler.guard.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(
    req: AuthenticatedRequest,
  ): Promise<string> {
    // If the request is authenticated, rate limit by user_id
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }

    // Fallback to IP address if user is unauthenticated
    const forwardedFor: undefined | string | string[] =
      req.headers['x-forwarded-for'];
    const ip: string =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : req.ip || '127.0.0.1';

    return `anon:${ip}`;
  }
}
