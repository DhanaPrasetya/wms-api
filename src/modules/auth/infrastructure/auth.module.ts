// src/modules/auth/infrastructure/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../../users/infrastructure/users.module';
import { AuthService } from '../application/auth.service';
import { AuthController } from './http/auth.controller';
import { JwtStrategy } from './passport/jwt.strategy';

@Module({
  imports: [
    UsersModule, // Gives access to UserService
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
