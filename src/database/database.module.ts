import { Module, Global, OnModuleDestroy } from '@nestjs/common';
import { closeDatabase, database } from './config/drizzleConnection';
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
export class DatabaseModule implements OnModuleDestroy {
  // makes the module global and implements OnModuleDestroy for cleanup
  async onModuleDestroy(): Promise<void> {
    await closeDatabase();
  }
}
