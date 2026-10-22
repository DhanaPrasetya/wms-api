import { Controller, Get, Query, Body, Patch, Res } from '@nestjs/common';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { Auth } from '../../common/decorators/auth.decorators';
import { SettingService } from './application/setting.service';
import { IndexDto } from './infrastructure/http/dto/index.dto';
import { UpdateSettingDto } from './infrastructure/http/dto/update-setting.dto';
import type { contextAccess } from './application/setting.service';
import type { Response } from 'express';
import { StandardResponse } from '../../common/decorators/standard-response.decorators';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingService: SettingService) {}

  @Auth('Root Admin')
  @StandardResponse()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getSettings(@Query() query: IndexDto) {
    const settings: object[] | undefined = await this.settingService.index(
      query.page,
      query.limit,
      query.name,
    );
    return settings;
  }

  @Auth('Root Admin')
  @StandardResponse()
  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateSetting(@Body() body: UpdateSettingDto) {
    await this.settingService.updateSetting(body.name, body.value);
    return { message: 'Setting updated successfully' };
  }

  @Get('.well-known/context.json')
  @HttpCode(HttpStatus.OK)
  async getContext(@Res({ passthrough: true }) res: Response) {
    const context: contextAccess = await this.settingService.getContext();

    res.setHeader('Content-Type', 'application/json');

    return context;
  }
}
