import { createPrivateKey } from 'node:crypto';
import type { FactoryProvider } from '@nestjs/common';
import Redis from 'ioredis';
import type OidcProvider from 'oidc-provider';
import type { Account, Configuration } from 'oidc-provider';
import { importEsm } from '../../../../common/helper/esm-import';
import { CACHE_CLIENT } from '../../../../cache/domain/port/cache.tokens';
import { OidcRedisAdapter } from './redis.adapter';
import {
  ISSUER,
  KEY_ID,
  MCP_RESOURCE,
  OIDC_PROVIDER,
  PRIVATE_KEY,
} from './oidc.constant';
type Jwks = NonNullable<Configuration['jwks']>;

/** Convert a PEM private key (PKCS#1 or PKCS#8) into the JWKS shape oidc-provider expects. */
function buildJwks(pem: string): Jwks {
  // Env vars often store PEMs with literal "\n" sequences
  const normalized: string = pem.replace(/\\n/g, '\n');

  const jwk: Record<string, unknown> = createPrivateKey(normalized).export({
    format: 'jwk',
  });
  if (jwk.kty !== 'RSA' || !jwk.n || !jwk.e) {
    throw new Error('PRIVATE_KEY must be an RSA private key (RS256)');
  }

  // RFC 7638 thumbprint as kid, so it is deterministic. This must equal the kid in your JWKS service.
  return {
    keys: [{ ...jwk, kid: KEY_ID, alg: 'RS256', use: 'sig' }],
  } as Jwks;
}

export const oidcProviderFactory: FactoryProvider<Promise<OidcProvider>> = {
  provide: OIDC_PROVIDER,
  inject: [CACHE_CLIENT],
  useFactory: async (redis: Redis): Promise<OidcProvider> => {
    const mod: typeof import('oidc-provider') =
      await importEsm<typeof import('oidc-provider')>('oidc-provider');
    const Provider: typeof OidcProvider = mod.default;
    const { errors } = mod;
    class ProviderRedisAdapter extends OidcRedisAdapter {
      constructor(model: string) {
        super(model, redis);
      }
    }

    const configuration: Configuration = {
      adapter: ProviderRedisAdapter,
      jwks: buildJwks(PRIVATE_KEY),

      cookies: { keys: [process.env.COOKIE_SECRET ?? 'dev-only-change-me'] },

      clientAuthMethods: ['none'],

      scopes: ['mcp', 'offline_access'], // mcp for the resource server, offline_access for refresh tokens

      pkce: { required: (): boolean => true },

      issueRefreshToken: async (_ctx, client, code): Promise<boolean> =>
        client.grantTypeAllowed('refresh_token') && code.scopes.has('mcp'),

      ttl: {
        AccessToken: 900,
        AuthorizationCode: 60,
        RefreshToken: 14 * 24 * 3600,
      },

      features: {
        devInteractions: { enabled: false },
        registration: { enabled: true },

        resourceIndicators: {
          enabled: true,
          defaultResource: (): string => MCP_RESOURCE,
          useGrantedResource: (): boolean => true,
          getResourceServerInfo: async (_ctx, indicator: string) => {
            if (indicator !== MCP_RESOURCE) throw new errors.InvalidTarget();
            return {
              scope: 'mcp',
              audience: MCP_RESOURCE,
              accessTokenFormat: 'jwt' as const,
              accessTokenTTL: 900,
              jwt: { sign: { alg: 'RS256', kid: KEY_ID } },
            };
          },
        },
      },

      interactions: {
        url: (_ctx, interaction): string => `/interaction/${interaction.uid}`,
      },

      findAccount: async (_ctx, sub: string): Promise<Account> => ({
        accountId: sub,
        claims: async () => ({ sub }),
      }),
    };

    const provider: OidcProvider = new Provider(ISSUER, configuration);
    provider.proxy = process.env.TRUST_PROXY === 'true';
    return provider;
  },
};
