import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module'; //  global module
import { AuthModule } from './modules/auth/infrastructure/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
