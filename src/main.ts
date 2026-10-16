import { OIDC_PROVIDER } from './modules/auth/infrastructure/oidc/oidc.constant';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import type OidcProvider from 'oidc-provider';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips non-whitelisted properties
      transform: true, // Enables class-transformer & @Transform()
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  });

  const oidcProvider: OidcProvider = app.get<OidcProvider>(OIDC_PROVIDER);
  const oidcJsonParser: express.RequestHandler = express.json();
  const oidcUrlencodedParser: express.RequestHandler = express.urlencoded({
    extended: true,
  });
  const oidcBodyParser = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    if (req.is('application/json')) {
      oidcJsonParser(req, res, next);
      return;
    }

    if (req.is('application/x-www-form-urlencoded')) {
      oidcUrlencodedParser(req, res, next);
      return;
    }

    next();
  };

  app.use('/oidc', oidcBodyParser);
  app.use('/oidc', (req: Request, _res: Response, next: NextFunction): void => {
    if (
      req.path === '/reg' &&
      req.body &&
      typeof req.body === 'object' &&
      req.body.scope === ''
    ) {
      delete req.body.scope;
    }

    next();
  });
  app.use('/oidc', oidcProvider.callback());

  await app.init();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
