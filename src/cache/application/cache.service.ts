import { Injectable, Inject } from '@nestjs/common';
import { CACHE_PORT } from '../domain/port/cache.adapter.port';
import type { CachePort } from '../domain/port/cache.adapter.port';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_PORT) private readonly userCache: CachePort) {}

  async get(key: string): Promise<string | null | object> {
    const cached: string | null | object = await this.userCache.get(key);
    if (cached) {
      return cached;
    }

    return null;
  }

  async set(key: string, ttlSeconds: number, value?: string | object) {
    await this.userCache.set(key, ttlSeconds, value);
  }

  async delete(key: string) {
    await this.userCache.delete(key);
  }
}
