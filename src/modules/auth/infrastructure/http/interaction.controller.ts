import {
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type OidcProvider from 'oidc-provider';
import type { Interaction } from 'oidc-provider';
import { OIDC_PROVIDER } from '../oidc/oidc.constant';
import { SettingService } from '../../../../modules/settings/application/setting.service';

interface ConsentPromptDetails {
  missingOIDCScope?: string[];
  missingResourceScopes?: Record<string, string[]>;
}

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

type OidcGrant = InstanceType<OidcProvider['Grant']>;

@Controller('interaction')
export class InteractionController {
  constructor(
    @Inject(OIDC_PROVIDER) private readonly provider: OidcProvider,
    private readonly settingService: SettingService,
  ) {}

  @Get(':uid')
  async show(@Req() req: Request, @Res() res: Response): Promise<void> {
    const isValidContextAccess: string | boolean =
      await this.settingService.isValidContextAccess(req.ip!);

    if (typeof isValidContextAccess === 'string') {
      throw new ForbiddenException(isValidContextAccess);
    }

    const { uid, prompt, params }: Interaction =
      await this.provider.interactionDetails(req, res);
    const clientId: string = escapeHtml(String(params.client_id));

    const html: string =
      prompt.name === 'login'
        ? `<form method="post" action="/interaction/${uid}/google">
             <button>Sign in with Google</button>
           </form>`
        : `<form method="post" action="/interaction/${uid}/confirm">
             <p>Allow <b>${clientId}</b> to access your MCP server?</p>
             <button>Allow</button>
           </form>`;

    res.type('html').send(html);
  }

  // The `confirm` handler is unchanged from the previous version
  @Post(':uid/confirm')
  async confirm(@Req() req: Request, @Res() res: Response): Promise<void> {
    const { prompt, params, session, grantId }: Interaction =
      await this.provider.interactionDetails(req, res);
    const details: ConsentPromptDetails =
      prompt.details as ConsentPromptDetails;

    const grant: OidcGrant | undefined = grantId
      ? await this.provider.Grant.find(grantId)
      : new this.provider.Grant({
          accountId: session?.accountId,
          clientId: String(params.client_id),
        });
    if (!grant) throw new Error('Grant not found');

    if (details.missingOIDCScope?.length)
      grant.addOIDCScope(details.missingOIDCScope.join(' '));
    for (const [indicator, scopes] of Object.entries(
      details.missingResourceScopes ?? {},
    )) {
      grant.addResourceScope(indicator, scopes.join(' '));
    }

    await this.provider.interactionFinished(
      req,
      res,
      { consent: { grantId: await grant.save() } },
      { mergeWithLastSubmission: true },
    );
  }
}
