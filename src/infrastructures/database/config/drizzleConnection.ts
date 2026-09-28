import { drizzle } from 'drizzle-orm/postgres-js';

async function startDrizzle() {
  const db = drizzle(process.env.DATABASE_URL!);

  const result = await db.execute('select 1');
}

startDrizzle()
  .then(() => console.log('---Database connected successfully---'))
  .catch((err) =>
    console.error('---Error starting database connection---', err),
  );
