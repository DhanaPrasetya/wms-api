export const OIDC_PROVIDER: unique symbol = Symbol('OIDC_PROVIDER');
import { createHash, createPrivateKey } from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

export const PORT: number = Number(process.env.PORT ?? 3000);
export const ISSUER: string = `http://localhost:${PORT}`;
export const MCP_RESOURCE: string =
  process.env.MCP_RESOURCE ?? 'http://localhost:5000/mcp';

function loadPrivateKeyPem(): string {
  const configuredKey: string | undefined = process.env.BASE64_PRIVATE_KEY;

  if (!configuredKey) {
    throw new Error('BASE64_PRIVATE_KEY is not configured');
  }

  const value: string = configuredKey.trim();
  const pem: string = value.includes('-----BEGIN')
    ? value.replace(/\\n/g, '\n')
    : Buffer.from(value.replace(/\s/g, ''), 'base64')
        .toString('utf8')
        .replace(/\\n/g, '\n')
        .trim();

  if (!pem.includes('-----BEGIN ') || !pem.includes(' PRIVATE KEY-----')) {
    throw new Error(
      'BASE64_PRIVATE_KEY must contain a PEM private key or its Base64 encoding',
    );
  }

  return pem;
}

export const PRIVATE_KEY: string = loadPrivateKeyPem();

export const KEY_ID: string = (() => {
  const jwk: Record<string, unknown> = createPrivateKey(PRIVATE_KEY).export({
    format: 'jwk',
  });

  if (
    jwk.kty !== 'RSA' ||
    typeof jwk.n !== 'string' ||
    typeof jwk.e !== 'string'
  ) {
    throw new Error('PRIVATE_KEY must be an RSA private key');
  }

  return createHash('sha256')
    .update(JSON.stringify({ e: jwk.e, kty: jwk.kty, n: jwk.n }))
    .digest('base64url');
})();
