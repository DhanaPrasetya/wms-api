import { Injectable, Inject } from '@nestjs/common';
import { CACHE_PORT } from '../domain/port/cache.adapter.port';
import type { CachePort } from '../domain/port/cache.adapter.port';
import { JwtPayload } from '../../modules/auth/application/auth.service';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_PORT) private readonly userCache: CachePort) {}

  async get(key: string): Promise<string | null> {
    return await this.userCache.get(key);
  }

  async set(key: string, ttlSeconds: number, value: string | object) {
    await this.userCache.set(key, ttlSeconds, value);
  }

  async delete(key: string) {
    await this.userCache.delete(key);
  }

  async getUserDataFromRefreshToken(
    refreshToken: string,
  ): Promise<JwtPayload | null> {
    return await this.userCache.getUserDataFromRefreshToken(refreshToken);
  }
}
