export const CACHE_PORT: symbol = Symbol('CACHE_PORT');

export interface CachePort {
  get(key: string): Promise<string | object | null>;
  set(key: string, ttlSeconds: number, value?: string | object): Promise<void>;
  delete(key: string): Promise<void>;
}
