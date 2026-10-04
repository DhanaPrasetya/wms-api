import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import type { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  Auth,
  CurrentUser,
  type AuthenticatedUser,
} from '../../../../common/decorators/auth.decorators';
import { ExtractAuthHeader } from '../../../../common/decorators/extract-auth-header.decorators';
import type { LoginCredentials } from '../../../../common/decorators/extract-auth-header.decorators';
import type { Request } from 'express';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private async setAuthCookies(
    res: Response,
    authToken: AuthTokens,
  ): Promise<void> {
    res.cookie('access_token', authToken.accessToken, {
      httpOnly: true,
      secure:
        process.env.ENVIRONMENT === 'prod' ||
        process.env.ENVIRONMENT === 'stage',
      sameSite: 'lax',
      maxAge: 3600000 * 1, // 1 hour in milliseconds
    });

    res.cookie('refresh_token', authToken.refreshToken, {
      httpOnly: true,
      secure:
        process.env.ENVIRONMENT === 'prod' ||
        process.env.ENVIRONMENT === 'stage',
      sameSite: 'lax',
      maxAge: 3600000 * 72, // 72 hours in milliseconds
    });
  }

  private async clearAuthCookies(res: Response): Promise<void> {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure:
        process.env.ENVIRONMENT === 'prod' ||
        process.env.ENVIRONMENT === 'stage',
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure:
        process.env.ENVIRONMENT === 'prod' ||
        process.env.ENVIRONMENT === 'stage',
      sameSite: 'lax',
      path: '/',
    });
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // Custom limit to 5 login attempts for 5 minutes
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @ExtractAuthHeader() userData: LoginCredentials,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authToken: AuthTokens = await this.authService.login(
      userData.email,
      userData.password,
    );

    await this.setAuthCookies(res, authToken);

    return { message: 'Logged in successfully !' };
  }

  @Auth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken: string | undefined = req.cookies?.['refresh_token'];

    await this.authService.logout(user, refreshToken);

    // Clear the cookie on logout
    await this.clearAuthCookies(res);

    return { message: 'Logged out successfully !' };
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken: string | undefined = req.cookies?.['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token cookie is required');
    }

    const newAuthTokens: AuthTokens =
      await this.authService.refreshingToken(refreshToken);

    await this.setAuthCookies(res, newAuthTokens);

    return { message: 'Token refreshed successfully !' };
  }
}
