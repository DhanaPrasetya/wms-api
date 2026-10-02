import { Module } from '@nestjs/common';
import { USER_REPOSITORY_PORT } from '../domain/port/user.repository.port';
import { DrizzleUserRepository } from './drizzle.user.repository';
import { UserService } from '../application/user.service';
import { UserController } from './http/user.controller';

@Module({
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY_PORT, // Token
      useClass: DrizzleUserRepository, // Concrete Drizzle implementation
    },
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
