import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

morgan.token('local', () => new Date().toLocaleString());

morgan.token('ip', (req: Request) => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
});

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly morganMiddleware = morgan(
    '\n:local :ip ":method :url" :status :response-time ms - :user-agent',
  );

  use(req: Request, res: Response, next: NextFunction) {
    this.morganMiddleware(req, res, next);
  }
}
