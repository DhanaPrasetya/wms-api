import { IsEnum, IsNotEmpty, ArrayMaxSize } from 'class-validator';
import { SettingsEnum } from '../../../../../enums/settings';

export class UpdateSettingDto {
  @IsNotEmpty({ message: 'Setting name is required' })
  @IsEnum(SettingsEnum, {
    message: `Setting name must be a valid SettingsEnum value (${Object.values(SettingsEnum).join(', ')})`,
  })
  name: SettingsEnum;
  @ArrayMaxSize(10, { message: 'Setting value cannot exceed 10 items' })
  @IsNotEmpty({ message: 'Setting value is required' })
  value: string[];
}
