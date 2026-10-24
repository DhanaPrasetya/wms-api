import { Injectable, OnModuleInit } from '@nestjs/common';
import type * as oauth from 'oauth4webapi';
import { randomBytes } from 'node:crypto';
import { importEsm } from '../../../common/helper/esm-import';

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

interface PendingAuth {
  uid: string; // the oidc-provider interaction this login belongs to
  verifier: string; // PKCE
  nonce: string;
  exp: number;
}

interface Ticket {
  uid: string;
  accountId: string;
  exp: number;
}

const GOOGLE_ISSUER: string = 'https://accounts.google.com';
const CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID ?? '';
const CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET ?? '';
export const GOOGLE_REDIRECT_URI: string =
  process.env.GOOGLE_REDIRECT_URI ??
  `http://localhost:4000/auth/google/callback`;

@Injectable()
export class GoogleAuthService implements OnModuleInit {
  private o!: typeof oauth;
  private as!: oauth.AuthorizationServer;
  private clientAuth!: oauth.ClientAuth;
  private readonly client: oauth.Client = { client_id: CLIENT_ID };

  // In-memory for the demo. Use Redis (with TTL) if you run multiple instances.
  private readonly pending = new Map<string, PendingAuth>(); // key: state
  private readonly tickets = new Map<string, Ticket>(); // key: one-time ticket

  async onModuleInit(): Promise<void> {
    this.o = await importEsm<typeof oauth>('oauth4webapi');
    const issuer: URL = new URL(GOOGLE_ISSUER);
    const res: Response = await this.o.discoveryRequest(issuer, {
      algorithm: 'oidc',
    });
    this.as = await this.o.processDiscoveryResponse(issuer, res);
    this.clientAuth = this.o.ClientSecretPost(CLIENT_SECRET);
  }

  /** Build the Google authorization URL for a given provider interaction. */
  async begin(uid: string): Promise<string> {
    const verifier: string = this.o.generateRandomCodeVerifier();
    const challenge: string = await this.o.calculatePKCECodeChallenge(verifier);
    const state: string = this.o.generateRandomState();
    const nonce: string = this.o.generateRandomNonce();

    this.pending.set(state, {
      uid,
      verifier,
      nonce,
      exp: Date.now() + 10 * 60_000,
    });

    const url: URL = new URL(this.as.authorization_endpoint as string);
    url.searchParams.set('client_id', CLIENT_ID);
    url.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    return url.toString();
  }

  /** Handle Google's redirect: validate state, exchange the code, verify the id_token. */
  async finish(
    callbackUrl: URL,
  ): Promise<{ uid: string; profile: GoogleProfile }> {
    const state: string = callbackUrl.searchParams.get('state') ?? '';
    const tx: PendingAuth | undefined = this.pending.get(state);
    this.pending.delete(state); // single use
    if (!tx || tx.exp < Date.now()) throw new Error('unknown or expired state');

    const params: URLSearchParams = this.o.validateAuthResponse(
      this.as,
      this.client,
      callbackUrl,
      state,
    );
    const response: Response = await this.o.authorizationCodeGrantRequest(
      this.as,
      this.client,
      this.clientAuth,
      params,
      GOOGLE_REDIRECT_URI,
      tx.verifier,
    );
    const result: oauth.TokenEndpointResponse =
      await this.o.processAuthorizationCodeResponse(
        this.as,
        this.client,
        response,
        {
          expectedNonce: tx.nonce,
          requireIdToken: true,
        },
      );

    const claims: oauth.IDToken | undefined =
      this.o.getValidatedIdTokenClaims(result);
    if (!claims) throw new Error('no id_token claims');

    return {
      uid: tx.uid,
      profile: {
        sub: claims.sub,
        email: String(claims.email ?? ''),
        emailVerified: claims.email_verified === true,
        name: typeof claims.name === 'string' ? claims.name : undefined,
      },
    };
  }

  /** One-time, short-lived hand-off from the callback to the interaction route. */
  issueTicket(uid: string, accountId: string): string {
    const ticket: string = randomBytes(32).toString('base64url');
    this.tickets.set(ticket, { uid, accountId, exp: Date.now() + 60_000 });
    return ticket;
  }

  consumeTicket(ticket: string, uid: string): string {
    const t: Ticket | undefined = this.tickets.get(ticket);
    this.tickets.delete(ticket);
    if (!t || t.exp < Date.now() || t.uid !== uid)
      throw new Error('invalid ticket');
    return t.accountId;
  }
}
