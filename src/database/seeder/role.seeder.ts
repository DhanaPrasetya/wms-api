import { eq } from 'drizzle-orm';
import argon2 from 'argon2';
import { database } from '../config/drizzleConnection';
import { roles, users } from '../schema';

const INITIAL_ROLES = [
  {
    name: 'Root Admin',
  },
  {
    name: 'Manager',
  },
  {
    name: 'Inventory Staff',
  },
  {
    name: 'Accountant',
  },
  {
    name: 'Sales Staff',
  },
];

// const INITIAL_SETTINGS = [
//   { name: 'allowed_ip', value: '127.0.0.1,192.168.1.1' },
//   { name: 'work_hours', value: '08:00-17:00' },
//   { name: 'work_days', value: 'Monday-Friday' },
// ];

async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed Roles (Idempotent: skips if primary key exists)
    console.log('Seeding roles...');
    await database
      .insert(roles)
      .values(INITIAL_ROLES)
      .onConflictDoNothing({ target: roles.id });

    // Get the ID of the Root Admin role
    const adminRoleid = await database
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, 'Root Admin'))
      .limit(1);

    const adminRole = adminRoleid[0];
    if (!adminRole) {
      throw new Error('Root Admin role was not found');
    }

    // Seed Settings (Idempotent: updates value if setting name exists)
    // console.log('Seeding settings...');
    // await database
    //   .insert(settings)
    //   .values(INITIAL_SETTINGS)
    //   .onConflictDoNothing();

    // Seed Initial Admin User
    console.log('Seeding root admin user...');
    await database
      .insert(users)
      .values({
        role_id: adminRole.id,
        email: 'admin@wms-api.com',
        name: 'System Admin',
        password: await hashPassword('rahasia123'),
        is_active: true,
      })
      .onConflictDoNothing({ target: users.email });

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Execute the seeder
seed();
