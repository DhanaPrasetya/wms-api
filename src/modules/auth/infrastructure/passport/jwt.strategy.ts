import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UserService } from '../../../users/application/user.service';
import type { UserLoginData } from '../../../users/domain/port/user.repository.port';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      // Custom extractor reads token directly from request cookies
      jwtFromRequest: (req: Request) => {
        if (req && req.cookies) {
          return req.cookies['access_token'] || null;
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    const user: UserLoginData = await this.userService.findByEmail(
      payload.email,
    );
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return user;
  }
}
