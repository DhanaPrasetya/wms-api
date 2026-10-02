import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema/index';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing');
}

const client = postgres(process.env.DATABASE_URL);

export const database = drizzle(client, { schema });

export async function closeDatabase(): Promise<void> {
  // Close the database connection gracefully
  await client.end({ timeout: 5 });
}
