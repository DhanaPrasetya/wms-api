export const SETTING_REPOSITORY_PORT: unique symbol = Symbol(
  // token for dependency injection
  'SETTING_REPOSITORY_PORT',
);

export interface SettingData {
  id: string;
  name: string;
  value: string[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface SettingsRepositoryInterface {
  index(
    page: number,
    limit: number,
    settingName?: string,
  ): Promise<SettingData[]>;
  updateSetting(settingName: string, newValue: string[]): Promise<void>;
}
