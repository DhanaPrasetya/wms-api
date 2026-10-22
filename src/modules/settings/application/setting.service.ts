import { Injectable, Inject } from '@nestjs/common';
import { SETTING_REPOSITORY_PORT } from '../domain/port/setting.repository.port';
import type {
  SettingData,
  SettingsRepositoryInterface,
} from '../domain/port/setting.repository.port';
import { defaultPage, defaultLimit } from '../../../enums/default-pagination';

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
  ) {}

  public async getContext(): Promise<contextAccess> {
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

    return context;
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
  }
}
