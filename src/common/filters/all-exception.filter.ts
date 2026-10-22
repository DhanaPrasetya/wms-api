import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  success: false;
  message: string;
  data: null;
  errors: string[] | null;
  timestamp: string;
  path: string;
}

// Shape of what HttpException.getResponse() can return
interface HttpExceptionBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

interface ParsedException {
  status: number;
  message: string;
  errors: string[] | null;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter<unknown> {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx: { getResponse: () => Response; getRequest: () => Request } =
      host.switchToHttp();
    const res: Response = ctx.getResponse();
    const req: Request = ctx.getRequest();

    const { status, message, errors } = this.parseException(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${req.method} ${req.originalUrl} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseBody = {
      success: false,
      message,
      data: null,
      errors,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };

    res.status(status).json(body);
  }

  private parseException(exception: unknown): ParsedException {
    if (!(exception instanceof HttpException)) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error', // never leak internals
        errors: null,
      };
    }

    const status: number = exception.getStatus();
    const response: string | object = exception.getResponse();

    if (typeof response === 'string') {
      return { status, message: response, errors: null };
    }

    const body: HttpExceptionBody = response as HttpExceptionBody;

    // ValidationPipe returns `message` as string[]
    if (Array.isArray(body.message)) {
      return { status, message: 'Validation failed', errors: body.message };
    }

    return {
      status,
      message: body.message ?? exception.message,
      errors: null,
    };
  }
}
