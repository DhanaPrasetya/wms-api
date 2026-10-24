import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SettingsEnum } from '../../../../../enums/settings';
import { defaultPage, defaultLimit } from '../../../../../enums/pagination';

export class IndexDto {
  @IsOptional()
  @IsEnum(SettingsEnum, {
    message: `Setting name must be a valid SettingsEnum value (${Object.values(SettingsEnum).join(', ')})`,
  })
  name?: SettingsEnum;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Max(100, { message: 'Page cannot exceed 100' })
  page: number = defaultPage;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit: number = defaultLimit;
}
