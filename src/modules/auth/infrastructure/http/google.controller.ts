import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type OidcProvider from 'oidc-provider';
import { OIDC_PROVIDER } from '../oidc/oidc.constant';
import { AuthService } from '../../application/auth.service';
import {
  GoogleAuthService,
  GoogleProfile,
  GOOGLE_REDIRECT_URI,
} from '../../application/google-auth.service';

@Controller('interaction')
export class GoogleController {
  constructor(
    @Inject(OIDC_PROVIDER) private readonly provider: OidcProvider,
    private readonly google: GoogleAuthService,
    private readonly auth: AuthService,
  ) {}

  /** Step 1: user clicked "Sign in with Google" → send them to Google. */
  @Post(':uid/google')
  async start(@Param('uid') uid: string, @Res() res: Response): Promise<void> {
    // Make sure this interaction really exists and the browser owns it
    await this.provider.interactionDetails(res.req, res);
    res.redirect(await this.google.begin(uid));
  }

  /** Step 2: Google redirects back here (fixed URI registered in Google Console). */
  @Get('callback/google')
  async callback(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const url: URL = new URL(GOOGLE_REDIRECT_URI);
      url.search = new URL(req.originalUrl, 'http://placeholder').search;

      const { uid, profile }: { uid: string; profile: GoogleProfile } =
        await this.google.finish(url);

      if (!(await this.auth.isValidOauthLogin(profile.email))) {
        res
          .status(403)
          .type('text')
          .send('This Google account is not registered or is inactive');
        return;
      }

      const accountId: string = await this.auth.findOrCreateFromGoogle(profile);
      const ticket: string = this.google.issueTicket(uid, accountId);

      // Bounce to a path under /interaction/:uid so the provider's interaction cookie is sent
      res.redirect(`/interaction/${uid}/google/complete?ticket=${ticket}`);
    } catch {
      res.status(400).type('text').send('Google sign-in failed');
    }
  }

  /** Step 3: tell oidc-provider the user is logged in as `accountId`. */
  @Get(':uid/google/complete')
  async complete(
    @Param('uid') uid: string,
    @Query('ticket') ticket: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    let accountId: string;
    try {
      accountId = this.google.consumeTicket(ticket, uid);
    } catch {
      res.status(400).type('text').send('Invalid or expired login ticket');
      return;
    }

    // Throws if this browser doesn't hold the cookie for this interaction
    await this.provider.interactionDetails(req, res);

    await this.provider.interactionFinished(
      req,
      res,
      { login: { accountId } },
      { mergeWithLastSubmission: false },
    );
  }
}
