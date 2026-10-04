import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { CachePort } from '../domain/port/cache.adapter.port';
import { CACHE_CLIENT } from '../domain/port/cache.tokens';

@Injectable()
export class RedisAdapter implements CachePort {
  constructor(@Inject(CACHE_CLIENT) private readonly redis: Redis) {}

  async get(key: string): Promise<string | object | null> {
    const data: string | object | null = await this.redis.get(key);
    return data;
  }

  async set(
    key: string,
    ttlSeconds: number,
    value?: string | object,
  ): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
