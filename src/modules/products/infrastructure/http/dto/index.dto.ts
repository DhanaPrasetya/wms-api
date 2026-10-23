import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SettingsEnum } from '../../../../../enums/settings';
import {
  defaultPage,
  defaultLimit,
  orderByEnum,
  defaultOrderBy,
  maxLimit,
} from '../../../../../enums/pagination';

export class IndexDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: SettingsEnum;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page: number = defaultPage;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(maxLimit, { message: `Limit cannot exceed ${maxLimit}` })
  limit: number = defaultLimit;

  @IsOptional()
  @IsEnum(orderByEnum, {
    message: `Order by must be a valid orderByEnum value (${Object.values(orderByEnum).join(', ')})`,
  })
  order_by: orderByEnum = defaultOrderBy;
}
