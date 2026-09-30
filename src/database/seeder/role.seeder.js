import { database } from '../config/drizzleConnection.js'; // Import your configured drizzle instance
import { roles, settings, users } from '../schema.js'; // Import your schema tables

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

const INITIAL_ADMIN_USER = {
  role_id: '',
  email: 'admin@wms-api.com',
  name: 'System Admin',
  password: 'secret123', // need to hash
  is_active: true,
};

// 2. Main Seed Function
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
      .where(roles.name.eq('Root Admin'))
      .get();
    INITIAL_ADMIN_USER.role_id = adminRoleid[0].id;

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
      .values(INITIAL_ADMIN_USER)
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
