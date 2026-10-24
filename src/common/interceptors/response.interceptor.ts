import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  STANDARD_RESPONSE_KEY,
  StandardResponseOptions,
} from '../../common/decorators/standard-response.decorators';

interface WrappedResult {
  data: unknown;
  meta?: Record<string, unknown>;
  message?: string;
}

interface SuccessResponseBody {
  success: true;
  message: string;
  data: unknown;
  meta?: Record<string, unknown>;
  timestamp: string;
  path: string;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    // getAllAndOverride checks the handler first, then the controller class
    const options: StandardResponseOptions | undefined =
      this.reflector.getAllAndOverride<StandardResponseOptions | undefined>(
        STANDARD_RESPONSE_KEY,
        [context.getHandler(), context.getClass()],
      );

    // Decorator not present -> pass through untouched
    if (!options) return next.handle();

    const req: Request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((result): SuccessResponseBody => {
        const isWrapped: boolean =
          typeof result === 'object' && result !== null && 'data' in result;
        const wrapped: WrappedResult | null = isWrapped
          ? (result as WrappedResult)
          : null;

        return {
          success: true,
          message: wrapped?.message ?? options.message ?? 'OK',
          data: wrapped ? wrapped.data : (result ?? null),
          ...(wrapped?.meta ? { meta: wrapped.meta } : {}),
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        };
      }),
    );
  }
}
