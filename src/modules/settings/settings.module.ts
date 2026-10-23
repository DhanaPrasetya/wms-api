import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingService } from './application/setting.service';
import { SETTING_REPOSITORY_PORT } from './domain/port/setting.repository.port';
import { DrizzleSettingsRepository } from './infrastructure/drizzle.setting.repository';
import { CacheModule } from '../../cache/cache.module';

@Module({
  providers: [
    SettingService,
    {
      provide: SETTING_REPOSITORY_PORT,
      useClass: DrizzleSettingsRepository,
    },
  ],
  controllers: [SettingsController],
  imports: [CacheModule],
  exports: [SettingService],
})
export class SettingsModule {}
