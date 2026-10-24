import Redis from 'ioredis';

type OidcPayload = Record<string, unknown>;

const GRANTABLE_MODELS: Set<string> = new Set([
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'BackchannelAuthenticationRequest',
  'PreAuthorizedCode',
]);

export class OidcRedisAdapter {
  constructor(
    private readonly model: string,
    private readonly redis: Redis,
    private readonly namespace = 'oidc',
  ) {}

  private key(id: string): string {
    return `${this.namespace}:${this.model}:${id}`;
  }

  private sessionUidKey(uid: string): string {
    return `${this.namespace}:index:session:${uid}`;
  }

  private userCodeKey(userCode: string): string {
    return `${this.namespace}:index:user-code:${userCode}`;
  }

  private grantKey(grantId: string): string {
    return `${this.namespace}:grant:${grantId}`;
  }

  private async read(id: string): Promise<OidcPayload | undefined> {
    const value: string | null = await this.redis.get(this.key(id));
    return value ? (JSON.parse(value) as OidcPayload) : undefined;
  }

  private async removeIndexes(id: string, payload: OidcPayload): Promise<void> {
    const uid: unknown = payload.uid;
    if (typeof uid === 'string') {
      await this.redis.del(this.sessionUidKey(uid));
    }

    const userCode: unknown = payload.userCode;
    if (typeof userCode === 'string') {
      await this.redis.del(this.userCodeKey(userCode));
    }

    const grantId: unknown = payload.grantId;
    if (GRANTABLE_MODELS.has(this.model) && typeof grantId === 'string') {
      await this.redis.srem(this.grantKey(grantId), this.key(id));
    }
  }

  async upsert(
    id: string,
    payload: OidcPayload,
    expiresIn?: number,
  ): Promise<void> {
    const previous: OidcPayload | undefined = await this.read(id);
    if (previous) {
      await this.removeIndexes(id, previous);
    }

    const key: string = this.key(id);
    const serialized: string = JSON.stringify(payload);
    if (typeof expiresIn === 'number') {
      await this.redis.set(key, serialized, 'EX', Math.max(1, expiresIn));
    } else {
      await this.redis.set(key, serialized);
    }

    const uid: unknown = payload.uid;
    if (this.model === 'Session' && typeof uid === 'string') {
      await this.redis.set(this.sessionUidKey(uid), id);
      if (typeof expiresIn === 'number') {
        await this.redis.expire(
          this.sessionUidKey(uid),
          Math.max(1, expiresIn),
        );
      }
    }

    const userCode: unknown = payload.userCode;
    if (typeof userCode === 'string') {
      await this.redis.set(this.userCodeKey(userCode), id);
      if (typeof expiresIn === 'number') {
        await this.redis.expire(
          this.userCodeKey(userCode),
          Math.max(1, expiresIn),
        );
      }
    }

    const grantId: unknown = payload.grantId;
    if (GRANTABLE_MODELS.has(this.model) && typeof grantId === 'string') {
      const grantKey: string = this.grantKey(grantId);
      await this.redis.sadd(grantKey, key);
      if (typeof expiresIn === 'number') {
        await this.redis.expire(grantKey, Math.max(1, expiresIn));
      }
    }
  }

  async find(id: string): Promise<OidcPayload | undefined> {
    return this.read(id);
  }

  async destroy(id: string): Promise<void> {
    const payload: OidcPayload | undefined = await this.read(id);
    await this.redis.del(this.key(id));
    if (payload) {
      await this.removeIndexes(id, payload);
    }
  }

  async consume(id: string): Promise<void> {
    const payload: OidcPayload | undefined = await this.read(id);
    if (!payload) return;

    payload.consumed = Math.floor(Date.now() / 1000);
    const ttl: number = await this.redis.ttl(this.key(id));
    if (ttl > 0) {
      await this.redis.set(this.key(id), JSON.stringify(payload), 'EX', ttl);
    } else {
      await this.redis.set(this.key(id), JSON.stringify(payload));
    }
  }

  async findByUid(uid: string): Promise<OidcPayload | undefined> {
    const id: string | null = await this.redis.get(this.sessionUidKey(uid));
    return id ? this.find(id) : undefined;
  }

  async findByUserCode(userCode: string): Promise<OidcPayload | undefined> {
    const id: string | null = await this.redis.get(this.userCodeKey(userCode));
    return id ? this.find(id) : undefined;
  }

  async revokeByGrantId(grantId: string): Promise<void> {
    const grantKey: string = this.grantKey(grantId);
    const keys: string[] = await this.redis.smembers(grantKey);
    if (!keys.length) return;

    const payloads: Array<string | null> = await this.redis.mget(...keys);
    const removalPromises: Promise<void>[] = [];
    keys.forEach((key: string, index: number) => {
      const serialized: string | null = payloads[index];
      if (!serialized) return;

      const payload: OidcPayload = JSON.parse(serialized) as OidcPayload;
      const id: string = key.slice(key.lastIndexOf(':') + 1);
      removalPromises.push(this.removeIndexes(id, payload));
    });

    await Promise.all(removalPromises);
    await this.redis.del(...keys, grantKey);
  }
}
