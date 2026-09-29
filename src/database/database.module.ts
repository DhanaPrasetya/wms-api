import { Module, Global } from '@nestjs/common';
import { database } from './config/drizzleConnection';
import * as schema from './schema/index';

export const DATABASE = Symbol('DATABASE');
export const DATABASE_SCHEMA = Symbol('DATABASE_SCHEMA');

@Global()
@Module({
  providers: [
    { provide: DATABASE, useValue: database },
    { provide: DATABASE_SCHEMA, useValue: schema },
  ],
  exports: [DATABASE, DATABASE_SCHEMA],
})
export class DatabaseModule {}
