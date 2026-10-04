// src/modules/auth/infrastructure/passport/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import type { JwtPayload } from '../../application/auth.service';
import type { AuthenticatedUser } from '../../../../common/decorators/auth.decorators';
import { CacheService } from '../../../../cache/application/cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly cacheService: CacheService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.['access_token'] || null,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload) {
      throw new UnauthorizedException();
    }

    const blacklistedToken: string | null | object =
      await this.cacheService.get(`blacklist:${payload.jti}`);

    if (blacklistedToken) {
      throw new UnauthorizedException('Token has been blacklisted');
    }

    const reLogToken: string | null | object = await this.cacheService.get(
      `re-log:${payload.jti}`,
    );

    if (reLogToken) {
      throw new UnauthorizedException(
        'Token has been rotated, please re-login',
      );
    }

    return {
      id: payload.id,
      name: payload.name,
      role: payload.role,
      jti: payload.jti,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
