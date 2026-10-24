import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type OidcProvider from 'oidc-provider';
import { OIDC_PROVIDER } from '../oidc/oidc.constant';
import { SettingService } from '../../../settings/application/setting.service';

@Controller('oidc')
export class OidcController {
  constructor(
    @Inject(OIDC_PROVIDER) private readonly provider: OidcProvider,
    private readonly settingService: SettingService,
  ) {}

  @All('*')
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    const path: string = req.path.replace(/^\/oidc(?=\/|$)/, '') || '/';
    const queryStart: number = req.url.indexOf('?');
    req.url = path + (queryStart >= 0 ? req.url.slice(queryStart) : '');

    if (
      path === '/token' &&
      req.body &&
      typeof req.body === 'object' &&
      req.body.grant_type === 'refresh_token'
    ) {
      const contextAccess: boolean | string =
        await this.settingService.isValidContextAccess(req.ip ?? '');

      if (typeof contextAccess === 'string') {
        res.status(403).json({
          error: 'access_denied',
          error_description: contextAccess,
        });
        return;
      }
    }

    if (
      path === '/reg' &&
      req.body &&
      typeof req.body === 'object' &&
      req.body.scope === ''
    ) {
      delete req.body.scope;
    }

    this.provider.callback()(req, res);
  }
}
