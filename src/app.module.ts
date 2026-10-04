import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { DatabaseModule } from './database/database.module'; //  global module
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CacheModule } from './cache/cache.module'; //  global module

@Module({
  imports: [DatabaseModule, AuthModule, CacheModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Applies logging globally to all routes
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
