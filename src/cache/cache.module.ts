import { Module, Global, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './application/cache.service';
import { CACHE_PORT } from './domain/port/cache.adapter.port';
import { RedisAdapter } from './infrastructure/redis.adapter';
import { CACHE_CLIENT } from './domain/port/cache.tokens';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CACHE_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redisInstance: Redis = new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
          maxRetriesPerRequest: null,
        });

        redisInstance.on('error', (err) => {
          console.error('[Redis] Error:', err);
        });

        redisInstance.on('connect', () => {
          console.log('[Redis] Connected successfully');
        });

        return redisInstance;
      },
      inject: [ConfigService],
    },
    RedisAdapter,
    {
      provide: CACHE_PORT,
      useExisting: RedisAdapter,
    },
    CacheService,
  ],
  exports: [CACHE_CLIENT, CacheService],
})
export class CacheModule implements OnApplicationShutdown {
  constructor(private readonly configService: ConfigService) {}

  async onApplicationShutdown() {}
}
