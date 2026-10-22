import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingService } from './application/setting.service';
import { SETTING_REPOSITORY_PORT } from './domain/port/setting.repository.port';
import { DrizzleSettingsRepository } from './infrastructure/drizzle.setting.repository';

@Module({
  providers: [
    SettingService,
    {
      provide: SETTING_REPOSITORY_PORT,
      useClass: DrizzleSettingsRepository,
    },
  ],
  controllers: [SettingsController],
  exports: [SettingService],
})
export class SettingsModule {}
