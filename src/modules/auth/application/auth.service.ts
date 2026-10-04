import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/application/user.service';
import { CacheService } from '../../../cache/application/cache.service';
import type { UserLoginData } from '../../users/domain/port/user.repository.port';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedUser } from '../../../common/decorators/auth.decorators';

export interface JwtPayload {
  id: string;
  name: string;
  role: string;
  jti: string; // Unique identifier for the JWT
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, plainPassword);
  }

  private async rotatingRefreshToken(
    oldRefreshToken: string,
    ttl: number,
    user: object | string | null,
  ): Promise<void> {
    await this.cacheService.delete(`refresh:${oldRefreshToken}`); // delete the old refresh token from the cache
    await this.cacheService.set(
      `rotate:${oldRefreshToken}`,
      ttl,
      JSON.stringify(user),
    );
  }

  private async generateRefreshToken(): Promise<string> {
    const base62: string =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result: string = '';
    let length: number = 64; // Length of the refresh token
    for (let i: number = 0; i < length; i++) {
      result += base62.charAt(Math.floor(Math.random() * base62.length));
    }
    return result;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user: UserLoginData | null =
      await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedException(
        'User account is inactive. Please contact support.',
      );
    }

    const isPasswordValid: boolean = await this.verifyPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      // 1 hour default expiration time
      id: user.id,
      name: user.name,
      role: user.role.name,
      jti: uuidv4(),
    };

    const accessToken: string = this.jwtService.sign(payload);
    const refreshToken: string = await this.generateRefreshToken();

    await this.cacheService.set(
      `refresh:${refreshToken}`,
      3600 * 72, // 72 hours in seconds
      JSON.stringify(payload),
    );

    await this.cacheService.delete(`re-log:${payload.id}`); // enable authentication for the user again if they were previously forced to re-login

    return { accessToken, refreshToken };
  }

  async logout(user: AuthenticatedUser, refreshToken?: string): Promise<void> {
    const remainingTokenLifetime: number =
      user.exp! - Math.floor(Date.now() / 1000); // Calculate the remaining lifetime of the token in seconds

    await this.cacheService.set(
      // blacklist the access token in the cache with its remaining lifetime
      `blacklist:${user.jti}`,
      remainingTokenLifetime,
      'blacklisted',
    );

    if (refreshToken) {
      await this.rotatingRefreshToken(refreshToken, 3600 * 72, user); // rotate the refresh token if provided
    }
  }

  async refreshingToken(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let isRotatedToken: string | null | object = await this.cacheService.get(
      `rotate:${oldRefreshToken}`,
    );

    isRotatedToken = isRotatedToken
      ? JSON.parse(isRotatedToken as string)
      : null;

    if (isRotatedToken) {
      // if the refresh token is rotated, force the user to re-login
      await this.cacheService.delete(`rotate:${oldRefreshToken}`);
      await this.cacheService.set(
        `re-log:${oldRefreshToken}`,
        3600 * 72,
        JSON.stringify(isRotatedToken), // store the user data in the cache to force re-login
      );

      throw new UnauthorizedException(
        'Refresh token has been rotated, please re-login',
      );
    }

    let userData: string | object | null = await this.cacheService.get(
      `refresh:${oldRefreshToken}`,
    );

    if (!userData) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    userData = userData ? JSON.parse(userData as string) : null;

    userData!.jti = uuidv4(); // generate a new unique identifier for the new access token

    const newAccessToken: string = this.jwtService.sign(userData as JwtPayload);

    const newRefreshToken: string = await this.generateRefreshToken();

    await this.rotatingRefreshToken(oldRefreshToken, 3600 * 72, userData); // rotate the old refresh token
    await this.cacheService.set(
      `refresh:${newRefreshToken}`,
      3600 * 72, // 72 hours in seconds
      JSON.stringify(userData),
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
