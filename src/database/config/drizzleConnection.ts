import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema/index';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing');
}

const client = postgres(process.env.DATABASE_URL);

export const database = drizzle(client, { schema });

async function checkConnection() {
  try {
    await database.execute('SELECT 1');
    console.log('--- Database connected successfully ---');
  } catch (err) {
    console.error('--- Error starting database connection ---', err);
  }
}

checkConnection();
