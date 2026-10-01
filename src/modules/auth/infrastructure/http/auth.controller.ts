import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Headers,
} from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { Auth } from '../../../../common/decorators/auth.decorators';

type LoginData = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 300000 } }) // Custom Limit to 5 login attempts for 5 minutes
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers('authorization') authorization: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dto: LoginData = LoginDto.fromAuthorizationHeader(authorization);

    const accessToken: string = await this.authService.login(
      dto.email,
      dto.password,
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

  @Auth('Manager', 'Root Admin') // jwt verif, role whitelist verif, and user throttling
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
