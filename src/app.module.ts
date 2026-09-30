import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module'; //  global module
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [DatabaseModule, AuthModule],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Applies logging globally to all routes
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
