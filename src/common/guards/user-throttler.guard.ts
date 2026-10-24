import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { Request } from 'express';
import { CacheService } from '../../cache/application/cache.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

@Injectable()
export class UserThrottlerGuard implements CanActivate {
  constructor(private readonly cacheService: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: AuthenticatedRequest = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    if (!req.user?.id) {
      return true;
    }

    const result: {
      isPass: boolean;
      remainingTtlInSecond: number;
    } = await this.cacheService.isPassUserIdRateLimit(req.user.id);

    if (!result.isPass) {
      throw new ThrottlerException('Too many requests');
    }

    return true;
  }
}
