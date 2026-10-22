import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE } from '../../../database/database.module';
import { settings } from '../../../database/schema/index';
import * as schema from '../../../database/schema/index';

import {
  SettingsRepositoryInterface,
  SettingData,
} from '../domain/port/setting.repository.port';

@Injectable()
export class DrizzleSettingsRepository implements SettingsRepositoryInterface {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findByName(settingName: string): Promise<SettingData | undefined> {
    try {
      const data: SettingData | undefined =
        await this.db.query.settings.findFirst({
          where: and(eq(settings.name, settingName)),
        });
      return data;
    } catch (error: unknown) {
      throw error;
    }
  }

  async updateSetting(settingName: string, newValue: string[]): Promise<void> {
    try {
      await this.db
        .update(settings)
        .set({ value: newValue })
        .where(eq(settings.name, settingName));
    } catch (error: unknown) {
      throw error;
    }
  }

  async index(
    page: number,
    limit: number,
    settingName?: string,
  ): Promise<SettingData[]> {
    const offset: number = (page - 1) * limit;

    return this.db.query.settings.findMany({
      // Drizzle ignores `undefined` inside where, so no if/else is needed
      where: settingName ? eq(settings.name, settingName) : undefined,
      limit,
      offset,
    });
  }
}
