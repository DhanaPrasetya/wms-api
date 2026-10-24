import { Injectable, Inject } from '@nestjs/common';
import { SETTING_REPOSITORY_PORT } from '../domain/port/setting.repository.port';
import type {
  SettingData,
  SettingsRepositoryInterface,
} from '../domain/port/setting.repository.port';
import { defaultPage, defaultLimit } from '../../../enums/pagination';
import { CacheService } from '../../../cache/application/cache.service';

const CONTEXT_CACHE_KEY: string = 'settings:context';
const CONTEXT_CACHE_TTL_SECONDS: number = 300;

export type contextAccess = {
  whitelist_ips: string[];
  start_time: string;
  end_time: string;
};

@Injectable()
export class SettingService {
  constructor(
    @Inject(SETTING_REPOSITORY_PORT)
    private readonly settingRepository: SettingsRepositoryInterface,
    private readonly cacheService: CacheService,
  ) {}

  public async getContext(): Promise<contextAccess> {
    const cachedContext: string | null =
      await this.cacheService.get(CONTEXT_CACHE_KEY);

    if (cachedContext) {
      try {
        return JSON.parse(cachedContext) as contextAccess;
      } catch {
        await this.cacheService.delete(CONTEXT_CACHE_KEY);
      }
    }

    const contextData: SettingData[] = await this.index(
      defaultPage,
      defaultLimit,
    );

    const settings: Record<string, string[]> = contextData.reduce(
      (acc, { name, value }) => {
        acc[name] = value;
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const context: contextAccess = {
      whitelist_ips: settings.WHITELIST_IPS ?? [],
      start_time: settings.WORK_START_TIME?.[0] ?? '',
      end_time: settings.WORK_END_TIME?.[0] ?? '',
    };

    await this.cacheService.set(
      CONTEXT_CACHE_KEY,
      CONTEXT_CACHE_TTL_SECONDS,
      context,
    );

    return context;
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  private normalizeIp(ip: string): string {
    const normalizedIp: string = ip.trim().replace(/^::ffff:/, '');

    return normalizedIp === '::1' ? '127.0.0.1' : normalizedIp;
  }

  public async isValidContextAccess(ip: string): Promise<boolean | string> {
    const contextAccess: contextAccess = await this.getContext();

    const normalizedIp: string = this.normalizeIp(ip);

    if (!contextAccess.whitelist_ips.includes(normalizedIp)) {
      return 'Forbidden: Your are not connected to allowed network';
    }

    const now: Date = new Date();
    const currentMinutes: number = now.getHours() * 60 + now.getMinutes();

    const startMinutes: number = this.timeToMinutes(contextAccess.start_time);
    const endMinutes: number = this.timeToMinutes(contextAccess.end_time);

    // Check range (handles standard daytime ranges and overnight ranges)
    const isWithinHours: boolean =
      startMinutes <= endMinutes
        ? currentMinutes >= startMinutes && currentMinutes <= endMinutes
        : currentMinutes >= startMinutes || currentMinutes <= endMinutes;

    if (!isWithinHours) {
      return 'Forbidden: Access is not allowed outside work hours';
    }

    return true;
  }

  public async index(
    page: number = defaultPage,
    limit: number = defaultLimit,
    settingName?: string,
  ): Promise<SettingData[]> {
    const settings: SettingData[] = await this.settingRepository.index(
      page,
      limit,
      settingName,
    );
    return settings;
  }

  public async updateSetting(
    settingName: string,
    newValue: string[],
  ): Promise<void> {
    await this.settingRepository.updateSetting(settingName, newValue);
    await this.cacheService.delete(CONTEXT_CACHE_KEY);
  }
}
