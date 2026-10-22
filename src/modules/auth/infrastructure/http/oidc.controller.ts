import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type OidcProvider from 'oidc-provider';
import { OIDC_PROVIDER } from '../oidc/oidc.constant';

@Controller('oidc')
export class OidcController {
  constructor(@Inject(OIDC_PROVIDER) private readonly provider: OidcProvider) {}

  @All('*')
  handle(@Req() req: Request, @Res() res: Response): void {
    const path: string = req.path.replace(/^\/oidc(?=\/|$)/, '') || '/';
    const queryStart: number = req.url.indexOf('?');
    req.url = path + (queryStart >= 0 ? req.url.slice(queryStart) : '');

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
