import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from '../../users/infrastructure/users.module';
import { AuthService } from '../application/auth.service';
import { AuthController } from './http/auth.controller';
import { JwtStrategy } from './passport/jwt.strategy';
import { createPrivateKey, KeyObject } from 'node:crypto';
import { GoogleAuthService } from '../application/google-auth.service';
import { InteractionController } from './http/interaction.controller';
import { GoogleController } from './http/google.controller';
import { WellKnownController } from './http/well-known.controller';
import { oidcProviderFactory } from './oidc/oidc.provider';
import { PRIVATE_KEY } from './oidc/oidc.constant';

function getPrivateKey(): KeyObject {
  const privateKey: KeyObject = createPrivateKey({
    key: PRIVATE_KEY,
    format: 'pem',
  });

  if (privateKey.asymmetricKeyType !== 'rsa') {
    throw new Error(
      `PRIVATE_KEY must be an RSA private key, received: ${privateKey.asymmetricKeyType}`,
    );
  }

  return privateKey;
}

@Module({
  imports: [
    UsersModule, // Gives access to UserService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey: getPrivateKey(),
      signOptions: {
        algorithm: 'RS256',
        issuer: process.env.ISSUER,
        expiresIn: '1h',
      },
    }),
    ThrottlerModule.forRoot([{ limit: 80, ttl: 60000 }]), // 80 requests per minute for each user or ip
  ],
  controllers: [
    AuthController,
    GoogleController,
    InteractionController,
    WellKnownController,
  ],
  providers: [AuthService, JwtStrategy, GoogleAuthService, oidcProviderFactory],
  exports: [AuthService],
})
export class AuthModule {}
