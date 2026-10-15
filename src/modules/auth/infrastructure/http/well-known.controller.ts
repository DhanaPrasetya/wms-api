import { Controller, Get, Redirect } from '@nestjs/common';

@Controller('.well-known')
export class WellKnownController {
  @Get('oauth-authorization-server/oidc')
  @Redirect('/oidc/.well-known/openid-configuration', 307)
  metadata(): void {}
}
