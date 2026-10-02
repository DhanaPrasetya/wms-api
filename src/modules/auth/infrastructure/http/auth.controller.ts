import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import type { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Auth } from '../../../../common/decorators/auth.decorators';
import { ExtractAuthHeader } from '../../../../common/decorators/extract-auth-header.decorators';
import type { LoginCredentials } from '../../../../common/decorators/extract-auth-header.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // Custom limit to 5 login attempts for 5 minutes
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @ExtractAuthHeader() userData: LoginCredentials,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken: string = await this.authService.login(
      userData.email,
      userData.password,
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true, // Prevents client-side JS from reading the cookie (XSS protection)
      secure:
        process.env.ENVIRONMENT === 'prod' ||
        process.env.ENVIRONMENT === 'stage', // Only send over HTTPS in production
      sameSite: 'lax', // Protects against CSRF
      maxAge: 3600 * 1000, // 1 hour in milliseconds
    });

    return { message: 'Logged in successfully !' };
  }

  @Auth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear the cookie on logout
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}
