import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { CachePort } from '../domain/port/cache.adapter.port';
import { CACHE_CLIENT } from '../domain/port/cache.tokens';
import { JwtPayload } from '../../modules/auth/application/auth.service';

@Injectable()
export class RedisAdapter implements CachePort {
  constructor(@Inject(CACHE_CLIENT) private readonly redis: Redis) {}

  async get(key: string): Promise<string | null> {
    const data: string | object | null = await this.redis.get(key);

    return data;
  }

  async set(
    key: string,
    ttlSeconds: number,
    value: string | object,
  ): Promise<void> {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    await this.redis.set(key, value, 'EX', ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async getUserDataFromRefreshToken(
    refreshToken: string,
  ): Promise<JwtPayload | null> {
    const data: string | null = await this.redis.get(refreshToken);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as JwtPayload;
  }
}
