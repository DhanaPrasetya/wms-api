import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from '../../users/infrastructure/users.module';
import { AuthService } from '../application/auth.service';
import { AuthController } from './http/auth.controller';
import { JwtStrategy } from './passport/jwt.strategy';
import { createPrivateKey, KeyObject } from 'node:crypto';

function getPrivateKey(): KeyObject {
  const value: string | undefined = process.env.BASE64_PRIVATE_KEY;

  if (!value) {
    throw new Error('PRIVATE_KEY is not configured');
  }

  const pem: string = Buffer.from(value, 'base64').toString('utf8');

  const privateKey: KeyObject = createPrivateKey({
    key: pem,
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
        issuer: 'wms-api',
        expiresIn: '1h',
      },
    }),
    ThrottlerModule.forRoot([{ limit: 80, ttl: 60000 }]), // 80 requests per minute for each user or ip
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
