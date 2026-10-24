import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { DatabaseModule } from './database/database.module'; //  global module
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CacheModule } from './cache/cache.module'; //  global module
import { SettingsModule } from './modules/settings/settings.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { ProductModule } from './modules/products/infrastructure/product.module';

@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
  imports: [
    DatabaseModule,
    AuthModule,
    CacheModule,
    SettingsModule,
    ProductModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Applies logging globally to all routes
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
