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

  public async initializeOrAddRateLimitCount(
    key: string,
    ttlInSeconds: number,
    maxLimit: number,
  ): Promise<{ count: number; remainingTtlInSecond: number }> {
    const luaScript: string = `
      local ttl = tonumber(ARGV[1])
      local maxLimit = tonumber(ARGV[2])

      local current = tonumber(redis.call('GET', KEYS[1]))

      -- Key does not exist
      if not current then
        redis.call('SET', KEYS[1], 1, 'EX', ttl)
        return {1, ttl}
      end

      -- Ensure the key always has an expiration
      local remainingTtl = redis.call('TTL', KEYS[1])
      if remainingTtl == -1 then
        redis.call('EXPIRE', KEYS[1], ttl)
        remainingTtl = ttl
      end

      -- Don't increment beyond the configured limit
      if current > maxLimit then
        return {current, remainingTtl}
      end

      current = redis.call('INCR', KEYS[1])

      return {current, remainingTtl}
    `;

    const [count, remainingTtlInSecond]: [number, number] =
      (await this.redis.eval(
        luaScript,
        1,
        key,
        String(ttlInSeconds),
        String(maxLimit),
      )) as [number, number];

    return {
      count,
      remainingTtlInSecond,
    };
  }
}
