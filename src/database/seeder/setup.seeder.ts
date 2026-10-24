import { eq } from 'drizzle-orm';
import argon2 from 'argon2';
import { database } from '../config/drizzleConnection';
import { roles, users, settings } from '../schema';
import { SettingsEnum } from '../../enums/settings';

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

export let rootAdminData = {
  role_id: '', // will be set after seeding roles
  email: 'admin@wms-api.com',
  name: 'System Admin',
  password: 'rahasia123',
  is_active: true,
};

const WHITELISTED_IPS: string[] = process.env.WHITELISTED_IPS
  ? process.env.WHITELISTED_IPS.split(',').map((ip) => ip.trim())
  : [''];

const INITIAL_SETTINGS = [
  { name: SettingsEnum.WHITELIST_IPS, value: WHITELISTED_IPS },
  { name: SettingsEnum.WORK_START_TIME, value: ['08:00'] },
  { name: SettingsEnum.WORK_END_TIME, value: ['17:00'] },
];

async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
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

    console.log('Seeding settings...');
    await database
      .insert(settings)
      .values(INITIAL_SETTINGS)
      .onConflictDoNothing();

    rootAdminData.role_id = adminRole.id;
    rootAdminData.password = await hashPassword(rootAdminData.password);

    // Seed Initial Admin User
    console.log('Seeding root admin user...');
    await database
      .insert(users)
      .values(rootAdminData)
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
