import {
  applyDecorators,
  SetMetadata,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { AllExceptionsFilter } from '../filters/all-exception.filter';

export const STANDARD_RESPONSE_KEY: string = 'standardResponse';

export interface StandardResponseOptions {
  message?: string;
}

export const StandardResponse = (options: StandardResponseOptions = {}) =>
  applyDecorators(
    SetMetadata(STANDARD_RESPONSE_KEY, options),
    UseInterceptors(ResponseInterceptor),
    UseFilters(AllExceptionsFilter),
  );
