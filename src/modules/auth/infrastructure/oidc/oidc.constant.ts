export const OIDC_PROVIDER: unique symbol = Symbol('OIDC_PROVIDER');

export const PORT: number = Number(process.env.PORT ?? 4000);
export const ISSUER: string = `http://localhost:${PORT}/oidc`;
export const MCP_RESOURCE: string =
  process.env.MCP_RESOURCE ?? 'http://localhost:5000/mcp';
export const PRIVATE_KEY: string = Buffer.from(
  process.env.BASE64_PRIVATE_KEY || '',
  'base64',
).toString('utf8');
