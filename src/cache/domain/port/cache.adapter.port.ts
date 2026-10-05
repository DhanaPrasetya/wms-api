import { JwtPayload } from '../../../modules/auth/application/auth.service';

export const CACHE_PORT: symbol = Symbol('CACHE_PORT');

export interface CachePort {
  get(key: string): Promise<string | null>;
  set(key: string, ttlSeconds: number, value: string | object): Promise<void>;
  delete(key: string): Promise<void>;
  getUserDataFromRefreshToken(refreshToken: string): Promise<JwtPayload | null>;
}
